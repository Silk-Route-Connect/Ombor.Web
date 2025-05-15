import { CategoryStore } from "./CategoryStore";
import { NotificationStore } from "./NotificationStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: CategoryStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
