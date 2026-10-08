/** What the header shows: nothing, a problem, or a brief «Связь восстановлена». */
export type ConnectivityStatus = "connected" | "offline" | "backendDown" | "restored";

/** Why a save cannot reach the server: the device has no network, or the backend does not answer. */
export type SaveBlockCause = Extract<ConnectivityStatus, "offline" | "backendDown">;

/** What the UI reads from `ConnectivityStore`: the header status, the offline gate, reloads on return. */
export interface IConnectivityStore {
	/** True while the backend is unreachable (no response, timeout, gateway 502–504). */
	isBackendDown: boolean;
	/** True while the device has no network — until the backend answers again after it returns. */
	isOffline: boolean;
	/** True while either the device is offline or the backend is unreachable. */
	isDisconnected: boolean;
	status: ConnectivityStatus;
	/**
	 * The save gate (F-028, owner decision 2026-10-07): why a form's submit is held
	 * back now, null while connected. Device offline wins over an unreachable
	 * backend — without a network the server cannot be reached at all.
	 */
	saveBlockedBy: SaveBlockCause | null;
	/** When the backend last answered before this outage (ms epoch); null if it never did. */
	lastReachableAt: number | null;
	/** When the next automatic re-check runs; null while none is armed (checking, offline, hidden tab). */
	nextCheckAt: number | null;
	isChecking: boolean;
	/** Bumped when the connection returns and failed loads should re-run (not after a relapse). */
	reconnects: number;
	/**
	 * Whether a load failing for lack of a connection now re-runs by itself when the
	 * connection returns — false once a request failed again right after a
	 * recovery, so a route that keeps failing is not retried in a loop.
	 */
	reloadsOnReconnect: boolean;
	/** Probes the backend now («Проверить сейчас»). */
	checkNow(): Promise<void>;
}
