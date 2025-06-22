import { CategoryStore, ICategoryStore } from "./CategoryStore";
import { NotificationStore } from "./NotificationStore";
import { IPartnerStore, PartnerStore } from "./PartnerStore";
import ProductStore, { IProductStore } from "./ProductStore";
import { ISaleStore, SaleStore } from "./SaleStore";
import { ISelectedPartnerStore, SelectedPartnerStore } from "./SelectedPartnerStore";
import { ISupplyStore, SupplyStore } from "./SupplyStore";
import { TemplateStore } from "./TemplateStore";
import { ITransactionStore, TransactionStore } from "./TransactionStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: ICategoryStore;
	productStore: IProductStore;
	partnerStore: IPartnerStore;
	saleStore: ISaleStore;
	supplyStore: ISupplyStore;
	templateStore: TemplateStore;
	transactionStore: ITransactionStore;
	selectedPartnerStore: ISelectedPartnerStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
		this.partnerStore = new PartnerStore(this.notificationStore);
		this.saleStore = new SaleStore();
		this.supplyStore = new SupplyStore(this.notificationStore);
		this.templateStore = new TemplateStore(this.notificationStore);
		this.transactionStore = new TransactionStore(this.notificationStore);
		this.selectedPartnerStore = new SelectedPartnerStore(this.partnerStore, this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
