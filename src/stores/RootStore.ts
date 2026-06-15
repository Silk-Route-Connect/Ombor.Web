import AuthStore from "stores/AuthStore";
import { EmployeeStore, IEmployeeStore } from "stores/EmployeeStore";
import { IPayrollStore, PayrollStore } from "stores/PayrollStore";
import { ISelectedEmployeeStore, SelectedEmployeeStore } from "stores/SelectedEmployeeStore";

import { CategoryStore, ICategoryStore } from "./CategoryStore";
import { DashboardStore, IDashboardStore } from "./DashboardStore";
import { DebtStore, IDebtStore } from "./DebtStore";
import InventoryStore, { IInventoryStore } from "./InventoryStore";
import { NotificationStore } from "./NotificationStore";
import { OrderStore } from "./OrderStore";
import { IPartnerLedgerStore, PartnerLedgerStore } from "./PartnerLedgerStore";
import { IPartnerStore, PartnerStore } from "./PartnerStore";
import { IPaymentStore, PaymentStore } from "./PaymentStore";
import ProductStore, { IProductStore } from "./ProductStore";
import { ISaleStore, SaleStore } from "./SaleStore";
import { ISelectedPartnerStore, SelectedPartnerStore } from "./SelectedPartnerStore";
import { ISelectedPaymentStore, SelectedPaymentStore } from "./SelectedPaymentStore";
import { ISelectedProductStore, SelectedProductStore } from "./SelectedProductStore";
import { ISelectedTransactionStore, SelectedTransactionStore } from "./SelectedTransactionStore";
import { ISelectedWalletStore, SelectedWalletStore } from "./SelectedWalletStore";
import { ISelectedWarehouseStore, SelectedWarehouseStore } from "./SelectedWarehouseStore";
import { IStockAdjustmentStore, StockAdjustmentStore } from "./StockAdjustmentStore";
import { TemplateStore } from "./TemplateStore";
import { ITransactionStore, TransactionStore } from "./TransactionStore";
import { ITransferStore, TransferStore } from "./TransferStore";
import { IWalletStore, WalletStore } from "./WalletStore";
import { IWarehouseStore, WarehouseStore } from "./WarehouseStore";

export class RootStore {
	notificationStore: NotificationStore;
	categoryStore: ICategoryStore;
	productStore: IProductStore;
	partnerStore: IPartnerStore;
	partnerLedgerStore: IPartnerLedgerStore;
	saleStore: ISaleStore;
	templateStore: TemplateStore;
	transactionStore: ITransactionStore;
	selectedPartnerStore: ISelectedPartnerStore;
	selectedTransactionStore: ISelectedTransactionStore;
	selectedProductStore: ISelectedProductStore;
	paymentStore: IPaymentStore;
	selectedPaymentStore: ISelectedPaymentStore;
	inventoryStore: IInventoryStore;
	warehouseStore: IWarehouseStore;
	selectedWarehouseStore: ISelectedWarehouseStore;
	stockAdjustmentStore: IStockAdjustmentStore;
	transferStore: ITransferStore;
	orderStore: OrderStore;
	authStore: AuthStore;
	employeeStore: IEmployeeStore;
	selectedEmployeeStore: ISelectedEmployeeStore;
	payrollStore: IPayrollStore;
	walletStore: IWalletStore;
	selectedWalletStore: ISelectedWalletStore;
	debtStore: IDebtStore;
	dashboardStore: IDashboardStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
		this.partnerStore = new PartnerStore(this.notificationStore);
		this.partnerLedgerStore = new PartnerLedgerStore(this.notificationStore);
		this.saleStore = new SaleStore();
		this.templateStore = new TemplateStore(this.notificationStore);
		this.transactionStore = new TransactionStore(this.notificationStore);
		this.selectedPartnerStore = new SelectedPartnerStore(this.partnerStore, this.notificationStore);
		this.selectedTransactionStore = new SelectedTransactionStore(this.notificationStore);
		this.selectedProductStore = new SelectedProductStore(this.notificationStore);
		this.paymentStore = new PaymentStore(this.notificationStore);
		this.selectedPaymentStore = new SelectedPaymentStore(this.notificationStore);
		this.inventoryStore = new InventoryStore(this.notificationStore);
		this.warehouseStore = new WarehouseStore(this.notificationStore);
		this.selectedWarehouseStore = new SelectedWarehouseStore(this.notificationStore);
		this.stockAdjustmentStore = new StockAdjustmentStore(this.notificationStore);
		this.transferStore = new TransferStore(this.notificationStore);
		this.orderStore = new OrderStore(this.notificationStore);
		this.authStore = new AuthStore();
		this.employeeStore = new EmployeeStore(this.notificationStore);
		this.selectedEmployeeStore = new SelectedEmployeeStore(
			this.employeeStore,
			this.notificationStore,
		);
		this.payrollStore = new PayrollStore(this.notificationStore, this.employeeStore);
		this.walletStore = new WalletStore(this.notificationStore);
		this.selectedWalletStore = new SelectedWalletStore(this.notificationStore);
		this.debtStore = new DebtStore(this.notificationStore);
		this.dashboardStore = new DashboardStore(this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
