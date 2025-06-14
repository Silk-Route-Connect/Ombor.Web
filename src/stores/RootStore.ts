import { CategoryStore, ICategoryStore } from "./CategoryStore";
import { NotificationStore } from "./NotificationStore";
import { IPartnerStore, PartnerStore } from "./PartnerStore";
import ProductStore, { IProductStore } from "./ProductStore";
import { ISaleStore, SaleStore } from "./SaleStore";
import { ISupplyStore, SupplyStore } from "./SupplyStore";
import { TemplateStore } from "./TemplateStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: ICategoryStore;
	productStore: IProductStore;
	partnersStore: IPartnerStore;
	saleStore: ISaleStore;
	supplyStore: ISupplyStore;
	templateStore: TemplateStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
		this.partnersStore = new PartnerStore(this.notificationStore);
		this.saleStore = new SaleStore();
		this.supplyStore = new SupplyStore(this.notificationStore);
		this.templateStore = new TemplateStore(this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
