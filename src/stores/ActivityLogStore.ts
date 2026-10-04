import { isReady, Loadable, toLoadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { ActivityAction, ActivityRecordKind } from "models/activity";
import { TenantUser } from "models/settings";
import SettingsApi from "services/api/SettingsApi";
import { DateRangeValue, isDateRangeActive, toDayParams } from "utils/dateRange";

import { ActivityFeed, ActivityQuery } from "./ActivityFeed";
import { NotificationStore } from "./NotificationStore";

const PAGE_SIZE = 30;

/** «Этот месяц» — the Activity Log opens on the current month, not the whole history. */
const DEFAULT_PERIOD: DateRangeValue = { preset: "month" };

export interface IActivityLogStore {
	feed: ActivityFeed;
	/** The «Кто» filter's options — every user, deactivated ones included (rule 41). */
	users: Loadable<TenantUser[]>;
	dateRange: DateRangeValue;
	userFilter: number | null;
	kindFilter: ActivityRecordKind | null;
	actionFilter: ActivityAction | null;
	/** Any filter on, the period included — the empty state then says «Ничего не найдено». */
	readonly isFiltering: boolean;

	/** Loads the feed for the current filters and the users once. */
	open(): Promise<void>;
	setDateRange(value: DateRangeValue): void;
	setUserFilter(userId: number | null): void;
	setKindFilter(kind: ActivityRecordKind | null): void;
	setActionFilter(action: ActivityAction | null): void;
	clear(): void;
}

/**
 * The «Журнал действий» page (mvp-plan §17, rules 26–28): the filters — period,
 * who, what, action — applied server-side to one paged feed.
 */
export class ActivityLogStore implements IActivityLogStore {
	private readonly notificationStore: NotificationStore;

	readonly feed: ActivityFeed;
	users: Loadable<TenantUser[]> = "loading";
	dateRange: DateRangeValue = DEFAULT_PERIOD;
	userFilter: number | null = null;
	kindFilter: ActivityRecordKind | null = null;
	actionFilter: ActivityAction | null = null;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		this.feed = new ActivityFeed(notificationStore, PAGE_SIZE);
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get isFiltering(): boolean {
		return (
			isDateRangeActive(this.dateRange) ||
			this.userFilter !== null ||
			this.kindFilter !== null ||
			this.actionFilter !== null
		);
	}

	private get query(): ActivityQuery {
		return {
			...toDayParams(this.dateRange),
			userId: this.userFilter ?? undefined,
			entityKind: this.kindFilter ?? undefined,
			action: this.actionFilter ?? undefined,
		};
	}

	async open(): Promise<void> {
		await Promise.all([this.feed.load(this.query), this.ensureUsers()]);
	}

	setDateRange(value: DateRangeValue): void {
		this.dateRange = value;
		void this.feed.load(this.query);
	}

	setUserFilter(userId: number | null): void {
		this.userFilter = userId;
		void this.feed.load(this.query);
	}

	setKindFilter(kind: ActivityRecordKind | null): void {
		this.kindFilter = kind;
		void this.feed.load(this.query);
	}

	setActionFilter(action: ActivityAction | null): void {
		this.actionFilter = action;
		void this.feed.load(this.query);
	}

	clear(): void {
		this.feed.clear();
	}

	private async ensureUsers(): Promise<void> {
		if (isReady(this.users)) {
			return;
		}
		const result = await tryRun(() => SettingsApi.getUsers());
		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "activity.error.users");
		}
		runInAction(() => (this.users = toLoadable(result)));
	}
}

export default ActivityLogStore;
