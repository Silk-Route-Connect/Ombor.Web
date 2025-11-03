import AuthStore from "stores/AuthStore";
import EmployeeStore, { IEmployeeStore } from "stores/EmployeeStore";

import { CategoryStore, ICategoryStore } from "./CategoryStore";
import InventoryStore, { IInventoryStore } from "./InventoryStore";
import { NotificationStore } from "./NotificationStore";
import { IPartnerStore, PartnerStore } from "./PartnerStore";
import { IPaymentStore, PaymentStore } from "./PaymentStore";
import ProductStore, { IProductStore } from "./ProductStore";
import { ISaleStore, SaleStore } from "./SaleStore";
import { ISelectedPartnerStore, SelectedPartnerStore } from "./SelectedPartnerStore";
import { ISelectedProductStore, SelectedProductStore } from "./SelectedProductStore";
import { ISelectedTransactionStore, SelectedTransactionStore } from "./SelectedTransactionStore";
import { TemplateStore } from "./TemplateStore";
import { ITransactionStore, TransactionStore } from "./TransactionStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: ICategoryStore;
	productStore: IProductStore;
	partnerStore: IPartnerStore;
	saleStore: ISaleStore;
	templateStore: TemplateStore;
	transactionStore: ITransactionStore;
	selectedPartnerStore: ISelectedPartnerStore;
	selectedTransactionStore: ISelectedTransactionStore;
	selectedProductStore: ISelectedProductStore;
	paymentStore: IPaymentStore;
	inventoryStore: IInventoryStore;
	authStore: AuthStore;
	employeeStore: IEmployeeStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
		this.partnerStore = new PartnerStore(this.notificationStore);
		this.saleStore = new SaleStore();
		this.templateStore = new TemplateStore(this.notificationStore);
		this.transactionStore = new TransactionStore(this.notificationStore);
		this.selectedPartnerStore = new SelectedPartnerStore(this.partnerStore, this.notificationStore);
		this.selectedTransactionStore = new SelectedTransactionStore(
			this.notificationStore,
			this.transactionStore,
		);
		this.selectedProductStore = new SelectedProductStore(this.productStore, this.notificationStore);
		this.paymentStore = new PaymentStore(this.notificationStore);
		this.inventoryStore = new InventoryStore(this.notificationStore);
		this.authStore = new AuthStore();
		this.employeeStore = new EmployeeStore(this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
