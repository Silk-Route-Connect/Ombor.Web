import { makeAutoObservable } from "mobx";

import { ConnectivityBridge } from "../services/api/connectivityBridge";
import { HealthProbe } from "../services/api/healthApi";
import {
	browserConnectivityEnv,
	ConnectivityEnv,
	HEARTBEAT_MS,
	recheckDelay,
	RESTORED_FLASH_MS,
} from "./connectivityEnv";

/** What the header shows: nothing, a problem, or a brief «Связь восстановлена». */
export type ConnectivityStatus = "connected" | "offline" | "backendDown" | "restored";

export interface IConnectivityStore {
	/** True while the backend is unreachable (no response, timeout, gateway 502–504). */
	isBackendDown: boolean;
	/** True while the device has no network — until the backend answers again after it returns. */
	isOffline: boolean;
	/** True while either the device is offline or the backend is unreachable. */
	isDisconnected: boolean;
	status: ConnectivityStatus;
	/** When the backend last answered before this outage (ms epoch); null if it never did. */
	lastReachableAt: number | null;
	/** When the next automatic re-check runs; null while none is armed (checking, offline, hidden tab). */
	nextCheckAt: number | null;
	isChecking: boolean;
	/** Bumped on every return to connected — failed loads re-run on it. */
	reconnects: number;
	/** Probes the backend now («Проверить сейчас»). */
	checkNow(): Promise<void>;
}

/**
 * Backend reachability for the header status and the offline gate (F-028).
 *
 * Fed by the axios interceptors via `ConnectivityBridge` — a network error, a
 * timeout or a gateway 502 / 503 / 504 marks the backend down; any other
 * response (a 500 included: one endpoint failing is not an outage) marks it up —
 * and by the browser's online / offline events. While it is down the store
 * re-checks `GET /health` itself with a backoff (5 → 10 → 20 → 30 s), so the
 * header and the gate lift without waiting for the user's next request; while
 * the device is offline it waits for the `online` event instead. While connected
 * a one-a-minute heartbeat probes only a quiet tab, so an outage shows before the
 * user presses «Сохранить» and an active tab costs no extra requests. Nothing is
 * probed while the tab is hidden; coming back to it re-checks at once.
 */
export class ConnectivityStore implements IConnectivityStore {
	isBackendDown = false;
	isOffline: boolean;
	isChecking = false;
	isRestored = false;
	lastReachableAt: number | null = null;
	nextCheckAt: number | null = null;
	reconnects = 0;

	private readonly env: ConnectivityEnv;
	private readonly startedAt: number;
	private lastResponseAt: number | null = null;
	private lastProbeAt: number | null = null;
	private attempt = 0;
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
		if (this.isBackendDown) {
			return;
		}
		this.isBackendDown = true;
		this.endRestored();
		this.lastReachableAt = this.lastResponseAt;
		this.attempt = 0;
		this.schedule();
	}

	/** Interceptor: the backend answered (any status). */
	reportUp(): void {
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
		const result = await this.env.probe();
		this.settle(result);
	}

	/** Stops listening and every timer (tests; the app's store lives as long as the tab). */
	dispose(): void {
		this.unlisten();
		this.cancelTimer();
		this.endRestored();
	}

	private settle(result: HealthProbe): void {
		this.isChecking = false;
		if (result === "up") {
			this.lastResponseAt = this.env.now();
		}
		if (!this.env.isOnline()) {
			this.handleOffline();
			return;
		}
		if (result === "down") {
			this.isOffline = false;
			if (!this.isBackendDown) {
				this.reportDown();
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
		this.attempt = 0;
		this.reconnects += 1;
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
