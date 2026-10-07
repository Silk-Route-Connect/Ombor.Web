import { makeAutoObservable } from "mobx";

import { ConnectivityBridge } from "../services/api/connectivityBridge";
import { HealthProbe } from "../services/api/healthApi";
import {
	browserConnectivityEnv,
	ConnectivityEnv,
	HEARTBEAT_MS,
	recheckDelay,
	RELAPSE_MS,
	RESTORED_FLASH_MS,
} from "./connectivityEnv";
import { ConnectivityStatus, IConnectivityStore } from "./connectivityTypes";

/**
 * Backend reachability for the header status and the offline gate (F-028).
 *
 * Fed by the axios interceptors via `ConnectivityBridge` (a network error, a
 * timeout or a gateway 502–504 marks the backend down; any other response — a
 * 500 included, one endpoint failing is not an outage — marks it up) and by the
 * browser's online / offline events. While down it re-checks `GET /health` itself
 * (5 → 10 → 20 → 30 s), so the header and the gate lift without the user's next
 * request; offline it waits for the `online` event. While connected a once-a-minute
 * heartbeat probes a quiet tab only, so an outage shows before «Сохранить». A
 * hidden tab is never probed; coming back to it re-checks at once.
 *
 * A request failing within `RELAPSE_MS` of a recovery is the same outage
 * relapsing (one bad route, a gateway still warming up): the backoff carries on
 * and failed loads are not re-run again, so a route that keeps failing cannot
 * hold the app in «Нет связи» with a retry every few seconds.
 */
export class ConnectivityStore implements IConnectivityStore {
	isBackendDown = false;
	isOffline: boolean;
	isChecking = false;
	isRestored = false;
	lastReachableAt: number | null = null;
	nextCheckAt: number | null = null;
	reconnects = 0;
	reloadsOnReconnect = true;

	private readonly env: ConnectivityEnv;
	private readonly startedAt: number;
	private lastResponseAt: number | null = null;
	private lastProbeAt: number | null = null;
	private attempt = 0;
	private restoredAt: number | null = null;
	/** Counts the interceptor's reports; a probe that saw it move was overtaken. */
	private reports = 0;
	private timer: number | null = null;
	private restoredTimer: number | null = null;
	private readonly unlisten: () => void;

	constructor(env: ConnectivityEnv = browserConnectivityEnv) {
		this.env = env;
		this.startedAt = env.now();
		this.isOffline = !env.isOnline();
		makeAutoObservable<
			this,
			| "env"
			| "startedAt"
			| "lastResponseAt"
			| "lastProbeAt"
			| "attempt"
			| "restoredAt"
			| "reports"
			| "timer"
			| "restoredTimer"
			| "unlisten"
		>(
			this,
			{
				env: false,
				startedAt: false,
				lastResponseAt: false,
				lastProbeAt: false,
				attempt: false,
				restoredAt: false,
				reports: false,
				timer: false,
				restoredTimer: false,
				unlisten: false,
			},
			{ autoBind: true },
		);
		ConnectivityBridge.register(this.reportDown, this.reportUp);
		this.unlisten = env.listen({
			online: this.handleOnline,
			offline: this.handleOffline,
			visibility: this.handleVisibility,
		});
		this.schedule();
	}

	get isDisconnected(): boolean {
		return this.isOffline || this.isBackendDown;
	}

	get status(): ConnectivityStatus {
		if (this.isOffline) {
			return "offline";
		}
		if (this.isBackendDown) {
			return "backendDown";
		}
		return this.isRestored ? "restored" : "connected";
	}

	/** Interceptor: a request failed for lack of a connection. */
	reportDown(): void {
		this.reports += 1;
		this.markDown();
	}

	/** Interceptor: the backend answered (any status). */
	reportUp(): void {
		this.reports += 1;
		this.lastResponseAt = this.env.now();
		if (this.isDisconnected) {
			this.restore();
		}
	}

	async checkNow(): Promise<void> {
		if (this.isChecking) {
			return;
		}
		this.cancelTimer();
		this.isChecking = true;
		this.lastProbeAt = this.env.now();
		const reportsBefore = this.reports;
		const result = await this.env.probe();
		this.settle(result, this.reports !== reportsBefore);
	}

	/** Stops listening and every timer (tests; the app's store lives as long as the tab). */
	dispose(): void {
		this.unlisten();
		this.cancelTimer();
		this.endRestored();
	}

	private markDown(): void {
		if (this.isBackendDown) {
			return;
		}
		const relapse = this.restoredAt !== null && this.env.now() - this.restoredAt < RELAPSE_MS;
		this.isBackendDown = true;
		this.endRestored();
		this.lastReachableAt = this.lastResponseAt;
		this.attempt = relapse ? this.attempt + 1 : 0;
		this.reloadsOnReconnect = !relapse;
		this.schedule();
	}

	/** `overtaken`: a real request answered or failed while the probe was out — its word is newer. */
	private settle(result: HealthProbe, overtaken: boolean): void {
		this.isChecking = false;
		if (result === "up") {
			this.lastResponseAt = this.env.now();
		}
		if (!this.env.isOnline()) {
			this.handleOffline();
			return;
		}
		if (overtaken) {
			if (this.timer === null) {
				this.schedule();
			}
			return;
		}
		if (result === "down") {
			this.isOffline = false;
			if (!this.isBackendDown) {
				this.markDown();
				return;
			}
		} else if (result === "up" || this.isOffline) {
			// Back from offline, any answer proves the network; an outage needs a clean
			// /health — only "up" proves the API itself is back.
			if (this.isDisconnected) {
				this.restore();
				return;
			}
		}
		if (this.isBackendDown) {
			this.attempt += 1;
		}
		this.schedule();
	}

	private handleOffline(): void {
		this.isOffline = true;
		this.endRestored();
		this.lastReachableAt = this.lastResponseAt;
		this.cancelTimer();
	}

	private handleOnline(): void {
		// «Нет интернета» stays until the backend answers, so the header never
		// announces a recovery it has not seen.
		void this.checkNow();
	}

	private handleVisibility(): void {
		if (!this.env.isVisible()) {
			this.cancelTimer();
			return;
		}
		if (this.isOffline || this.isChecking) {
			return;
		}
		if (this.isBackendDown || this.quietFor() >= HEARTBEAT_MS) {
			void this.checkNow();
		} else {
			this.schedule();
		}
	}

	private restore(): void {
		this.isOffline = false;
		this.isBackendDown = false;
		this.restoredAt = this.env.now();
		if (this.reloadsOnReconnect) {
			this.reconnects += 1;
		}
		this.endRestored();
		this.isRestored = true;
		this.restoredTimer = this.env.setTimer(this.endRestored, RESTORED_FLASH_MS);
		this.schedule();
	}

	private endRestored(): void {
		if (this.restoredTimer !== null) {
			this.env.clearTimer(this.restoredTimer);
			this.restoredTimer = null;
		}
		this.isRestored = false;
	}

	/** Arms the one timer: the next re-check while down, the heartbeat while connected. */
	private schedule(): void {
		this.cancelTimer();
		if (this.isOffline || !this.env.isVisible()) {
			return;
		}
		if (this.isBackendDown) {
			const delay = recheckDelay(this.attempt);
			this.nextCheckAt = this.env.now() + delay;
			this.timer = this.env.setTimer(this.onTimer, delay);
			return;
		}
		this.timer = this.env.setTimer(this.onTimer, Math.max(0, HEARTBEAT_MS - this.quietFor()));
	}

	private onTimer(): void {
		this.timer = null;
		// A heartbeat whose minute saw traffic has nothing to prove — re-arm instead.
		if (!this.isBackendDown && this.quietFor() < HEARTBEAT_MS) {
			this.schedule();
			return;
		}
		void this.checkNow();
	}

	private cancelTimer(): void {
		if (this.timer !== null) {
			this.env.clearTimer(this.timer);
			this.timer = null;
		}
		this.nextCheckAt = null;
	}

	/** Time since the backend last answered or was last probed. */
	private quietFor(): number {
		return (
			this.env.now() - Math.max(this.lastResponseAt ?? 0, this.lastProbeAt ?? 0, this.startedAt)
		);
	}
}
