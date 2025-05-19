import { CategoryStore, ICategoryStore } from "./CategoryStore";
import { NotificationStore } from "./NotificationStore";
import ProductStore, { IProductStore } from "./ProductStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: ICategoryStore;
	productStore: IProductStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
