import { AxiosInstance, InternalAxiosRequestConfig } from "axios";

/** Marker error for a request short-circuited because the device is offline. */
export class OfflineError extends Error {
	readonly isOffline = true;

	constructor() {
		super("offline");
		this.name = "OfflineError";
	}
}

/** True for the {@link OfflineError} the offline guard rejects with. */
export function isOfflineError(err: unknown): boolean {
	return (
		err instanceof OfflineError ||
		(typeof err === "object" && err !== null && (err as { isOffline?: boolean }).isOffline === true)
	);
}

/**
 * Request guard (XC-14 / DEC-11): when the device is offline (`navigator.onLine`
 * is false) short-circuit the request instead of firing it, so the browser never
 * throws `net::ERR_INTERNET_DISCONNECTED` and the backend-down toast doesn't
 * flood on every call. The rejection is tagged {@link OfflineError} so the error
 * interceptor skips reporting it — the offline state is already surfaced by the
 * header indicator.
 */
export function attachOfflineGuard(instance: AxiosInstance): void {
	instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
		if (typeof navigator !== "undefined" && navigator.onLine === false) {
			return Promise.reject(new OfflineError());
		}
		return config;
	});
}
