import { isReady, Loadable, readyOr, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { NotificationAlert } from "models/notification";
import NotificationApi from "services/api/NotificationApi";
import {
	isUnseen,
	markSeen,
	reconcileSeen,
	sameSeen,
	SeenCounts,
	unseenCount,
} from "utils/alertSeen";

import AuthStore from "./AuthStore";

/** A window focus re-reads the alerts only when the last read is older than this. */
const FOCUS_REFRESH_AFTER_MS = 60_000;

export interface IAlertStore {
	alerts: Loadable<NotificationAlert[]>;
	/** The bell's badge: alerts that grew since «Отметить как прочитанные». */
	readonly unseenCount: number;

	load(): Promise<void>;
	/** Re-reads unless a read landed in the last minute (window focus). */
	refreshIfStale(): void;
	isUnseen(alert: NotificationAlert): boolean;
	markAllSeen(): void;
}

/**
 * The topbar bell (`GET /api/notifications`): overdue receivables, overdue and
 * today's deliveries, low stock. The server computes alerts on every read and
 * keeps no read state, so «прочитано» is remembered per user in localStorage —
 * a per-viewer convenience. A background re-read keeps the list on screen until
 * it lands; a failed read shows in the popover with «Повторить», never as
 * «Всё в порядке», and never toasts (a poll every few minutes would repeat it).
 */
export class AlertStore implements IAlertStore {
	private readonly authStore: AuthStore;
	private readonly loads = new LoadSequence();
	private lastLoadedAt = 0;
	/** The storage key `seen` was read from — the store outlives a sign-in (built before it). */
	private seenKey: string | null = null;
	private seen: SeenCounts = {};

	alerts: Loadable<NotificationAlert[]> = "loading";

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get unseenCount(): number {
		return unseenCount(readyOr(this.alerts, []), this.seen);
	}

	isUnseen(alert: NotificationAlert): boolean {
		return isUnseen(alert, this.seen);
	}

	async load(): Promise<void> {
		this.syncSeenWithUser();
		const isCurrent = this.loads.begin();
		if (!isReady(this.alerts)) {
			this.alerts = "loading";
		}

		const result = await tryRun(() => NotificationApi.getAll());
		if (!isCurrent()) {
			return;
		}
		runInAction(() => {
			this.alerts = toLoadable(result);
			this.lastLoadedAt = Date.now();
			if (result.status === "success") {
				this.saveSeen(reconcileSeen(result.data, this.seen));
			}
		});
	}

	refreshIfStale(): void {
		if (Date.now() - this.lastLoadedAt >= FOCUS_REFRESH_AFTER_MS) {
			void this.load();
		}
	}

	markAllSeen(): void {
		this.syncSeenWithUser();
		this.saveSeen(markSeen(readyOr(this.alerts, [])));
	}

	private storageKey(): string {
		return `ombor.notifications.seen.${this.authStore.getUser()?.id ?? "anon"}`;
	}

	private syncSeenWithUser(): void {
		const key = this.storageKey();
		if (key !== this.seenKey) {
			this.seenKey = key;
			this.seen = this.readSeen(key);
		}
	}

	private readSeen(key: string): SeenCounts {
		try {
			const raw = localStorage.getItem(key);
			const parsed: unknown = raw ? JSON.parse(raw) : {};
			return parsed && typeof parsed === "object" ? (parsed as SeenCounts) : {};
		} catch {
			return {};
		}
	}

	private saveSeen(next: SeenCounts): void {
		if (sameSeen(next, this.seen)) {
			return;
		}
		this.seen = next;
		try {
			localStorage.setItem(this.seenKey ?? this.storageKey(), JSON.stringify(next));
		} catch {
			/* storage unavailable — alerts just read as new again next session */
		}
	}
}

export default AlertStore;
