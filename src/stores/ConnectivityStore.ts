import i18next from "i18n/config";
import { makeAutoObservable } from "mobx";

import { ConnectivityBridge } from "../services/api/connectivityBridge";
import { NotificationStore } from "./NotificationStore";

export interface IConnectivityStore {
	/** True while the backend is unreachable (network error or 5xx). */
	isBackendDown: boolean;
	/** True while the device itself has no network (`navigator.onLine === false`). */
	isOffline: boolean;
	/** True while either the device is offline or the backend is unreachable. */
	isDisconnected: boolean;
}

/**
 * Tracks backend reachability so the UI can warn the user and block mutating
 * actions while the server is unresponsive (F-028). Fed by the axios error
 * interceptor via `ConnectivityBridge`: a network error or a 5xx marks it down;
 * any response received marks it back up.
 */
export class ConnectivityStore implements IConnectivityStore {
	private readonly notificationStore: NotificationStore;

	isBackendDown = false;
	isOffline = typeof navigator !== "undefined" && navigator.onLine === false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
		ConnectivityBridge.register(this.reportDown, this.reportUp);
		if (typeof window !== "undefined") {
			window.addEventListener("offline", this.setOffline);
			window.addEventListener("online", this.setOnline);
		}
	}

	/** True while either the device is offline or the backend is unreachable. */
	get isDisconnected(): boolean {
		return this.isOffline || this.isBackendDown;
	}

	/** Device lost its network (window `offline` event). */
	setOffline(): void {
		this.isOffline = true;
	}

	/** Device regained its network (window `online` event). */
	setOnline(): void {
		this.isOffline = false;
	}

	/** Called by the interceptor on a network error / 5xx. Toasts once per outage. */
	reportDown(): void {
		if (this.isBackendDown) {
			return;
		}
		this.isBackendDown = true;
		this.notificationStore.error(i18next.t("common.backendUnavailable"));
	}

	/** Called by the interceptor on any received response (the backend answered). */
	reportUp(): void {
		if (!this.isBackendDown) {
			return;
		}
		this.isBackendDown = false;
	}
}
