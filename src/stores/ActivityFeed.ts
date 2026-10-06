import { isReady, Loadable, LoadError, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, observable, runInAction } from "mobx";
import { ActivityItem, GetActivityRequest } from "models/activity";
import ActivityApi from "services/api/ActivityApi";

import { NotificationStore } from "./NotificationStore";

export type ActivityQuery = Omit<GetActivityRequest, "page" | "pageSize">;

/**
 * One server-paged Activity Log feed: the operations loaded so far for a query
 * («Показать ещё» appends the next page) and, on demand, the full change list
 * of an operation whose list item was capped at 50 changes. Composed by the
 * Activity Log page store and the detail pages' «История».
 */
export class ActivityFeed {
	private readonly notificationStore: NotificationStore;
	private readonly pageSize: number;
	private readonly loads = new LoadSequence();
	private query: ActivityQuery = {};
	private page = 0;

	items: Loadable<ActivityItem[]> = "loading";
	total = 0;
	loadingMore = false;
	readonly fullOperations = observable.map<string, Loadable<ActivityItem>>(undefined, {
		deep: false,
	});

	constructor(notificationStore: NotificationStore, pageSize: number) {
		this.notificationStore = notificationStore;
		this.pageSize = pageSize;
		// Operations are read-only snapshots, replaced whole — never made deeply observable.
		makeAutoObservable(this, { items: observable.ref }, { autoBind: true });
	}

	get hasMore(): boolean {
		return isReady(this.items) && this.items.length < this.total;
	}

	async load(query: ActivityQuery): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.query = query;
			this.items = "loading";
			this.total = 0;
			this.page = 0;
			this.loadingMore = false;
			this.fullOperations.clear();
		});

		const result = await tryRun(() =>
			ActivityApi.getPage({ ...query, page: 1, pageSize: this.pageSize }),
		);
		if (!isCurrent()) {
			return;
		}
		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "activity.error.load");
		}

		runInAction(() => {
			if (result.status === "success") {
				this.items = result.data.items;
				this.total = result.data.total;
				this.page = 1;
			} else {
				this.items = new LoadError(result.cause);
			}
		});
	}

	reload(): Promise<void> {
		return this.load(this.query);
	}

	async loadMore(): Promise<void> {
		if (!this.hasMore || this.loadingMore) {
			return;
		}
		const isCurrent = this.loads.begin();
		const next = this.page + 1;
		this.loadingMore = true;

		const result = await tryRun(() =>
			ActivityApi.getPage({ ...this.query, page: next, pageSize: this.pageSize }),
		);
		if (!isCurrent()) {
			return;
		}

		runInAction(() => {
			this.loadingMore = false;
			if (result.status === "fail") {
				this.notificationStore.notifyLoadError(result, "activity.error.loadMore");
				return;
			}
			const shown = isReady(this.items) ? this.items : [];
			// Operations recorded since the first page shift the pages down — skip repeats.
			const seen = new Set(shown.map((item) => item.operationId));
			const merged = [...shown, ...result.data.items.filter((item) => !seen.has(item.operationId))];
			this.items = merged;
			// A short page is the last one, even when that shift left the served total ahead of the list.
			this.total = result.data.items.length < this.pageSize ? merged.length : result.data.total;
			this.page = next;
		});
	}

	/** Every change of an operation, once `loadFullOperation` ran for it. */
	fullOperation(operationId: string): Loadable<ActivityItem> | undefined {
		return this.fullOperations.get(operationId);
	}

	async loadFullOperation(operationId: string): Promise<void> {
		const known = this.fullOperations.get(operationId);
		if (known === "loading" || (known !== undefined && isReady(known))) {
			return;
		}
		this.fullOperations.set(operationId, "loading");

		const result = await tryRun(() => ActivityApi.getOperation(operationId));
		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "activity.error.loadOperation");
		}
		runInAction(() => this.fullOperations.set(operationId, toLoadable(result)));
	}

	clear(): void {
		this.loads.invalidate();
		this.items = "loading";
		this.total = 0;
		this.page = 0;
		this.loadingMore = false;
		this.fullOperations.clear();
	}
}

export default ActivityFeed;
