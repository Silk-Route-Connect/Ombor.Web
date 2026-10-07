import { HealthProbe, probeHealth } from "../services/api/healthApi";

/** Re-check delays while the backend is down: 5 s, 10 s, 20 s, then every 30 s. */
const RECHECK_DELAYS_MS = [5_000, 10_000, 20_000, 30_000];

/** A quiet connection is probed once a minute (visible tab only). */
export const HEARTBEAT_MS = 60_000;

/** How long «Связь восстановлена» stays in the header. */
export const RESTORED_FLASH_MS = 3_000;

/** The wait before re-check number `attempt` (0-based) of one outage. */
export function recheckDelay(attempt: number): number {
	return RECHECK_DELAYS_MS[Math.min(attempt, RECHECK_DELAYS_MS.length - 1)];
}

export interface ConnectivityListeners {
	online: () => void;
	offline: () => void;
	visibility: () => void;
}

/**
 * Everything `ConnectivityStore` needs from the browser — clock, timers, the
 * network and tab-visibility signals and the liveness probe — behind one seam,
 * so the store's state machine runs under a fake clock and a scripted probe.
 */
export interface ConnectivityEnv {
	now(): number;
	setTimer(callback: () => void, ms: number): number;
	clearTimer(handle: number): void;
	/** `navigator.onLine` — false is reliable, true only means «a network exists». */
	isOnline(): boolean;
	isVisible(): boolean;
	/** Subscribes to the window online / offline and document visibility events. */
	listen(listeners: ConnectivityListeners): () => void;
	probe(): Promise<HealthProbe>;
}

export const browserConnectivityEnv: ConnectivityEnv = {
	now: () => Date.now(),
	setTimer: (callback, ms) => window.setTimeout(callback, ms),
	clearTimer: (handle) => window.clearTimeout(handle),
	isOnline: () => navigator.onLine !== false,
	isVisible: () => document.visibilityState !== "hidden",
	listen: ({ online, offline, visibility }) => {
		window.addEventListener("online", online);
		window.addEventListener("offline", offline);
		document.addEventListener("visibilitychange", visibility);
		return () => {
			window.removeEventListener("online", online);
			window.removeEventListener("offline", offline);
			document.removeEventListener("visibilitychange", visibility);
		};
	},
	probe: probeHealth,
};
