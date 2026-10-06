import { makeAutoObservable } from "mobx";
import { ActivityRecordKind } from "models/activity";

import { ActivityFeed } from "./ActivityFeed";
import { NotificationStore } from "./NotificationStore";

const PAGE_SIZE = 20;

export interface IEntityHistoryStore {
	feed: ActivityFeed;
	/** Loads the operations that touched this record or one of its lines, newest first. */
	open(kind: ActivityRecordKind, id: number): Promise<void>;
	clear(): void;
}

/** The «История» of the open detail page — the Activity Log narrowed to one record. */
export class EntityHistoryStore implements IEntityHistoryStore {
	readonly feed: ActivityFeed;

	constructor(notificationStore: NotificationStore) {
		this.feed = new ActivityFeed(notificationStore, PAGE_SIZE);
		makeAutoObservable(this, {}, { autoBind: true });
	}

	open(kind: ActivityRecordKind, id: number): Promise<void> {
		return this.feed.load({ entityKind: kind, entityId: id });
	}

	clear(): void {
		this.feed.clear();
	}
}

export default EntityHistoryStore;
