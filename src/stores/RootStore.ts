import AuthStore from "stores/AuthStore";
import { EmployeeStore, IEmployeeStore } from "stores/EmployeeStore";
import { IPayrollStore, PayrollStore } from "stores/PayrollStore";
import { ISelectedEmployeeStore, SelectedEmployeeStore } from "stores/SelectedEmployeeStore";

import { CategoryStore, ICategoryStore } from "./CategoryStore";
import { ConnectivityStore, IConnectivityStore } from "./ConnectivityStore";
import { DashboardStore, IDashboardStore } from "./DashboardStore";
import { DebtReminderStore, IDebtReminderStore } from "./DebtReminderStore";
import { DebtStore, IDebtStore } from "./DebtStore";
import { IInvoicePrintStore, InvoicePrintStore } from "./InvoicePrintStore";
import { IMovementSourceStore, MovementSourceStore } from "./MovementSourceStore";
import { NotificationStore } from "./NotificationStore";
import { IOnboardingStore, OnboardingStore } from "./OnboardingStore";
import { OrderStore } from "./OrderStore";
import { IPartnerLedgerStore, PartnerLedgerStore } from "./PartnerLedgerStore";
import { IPartnerStore, PartnerStore } from "./PartnerStore";
import { IPaymentStore, PaymentStore } from "./PaymentStore";
import ProductStore, { IProductStore } from "./ProductStore";
import { ISelectedPaymentStore, SelectedPaymentStore } from "./SelectedPaymentStore";
import { ISelectedProductStore, SelectedProductStore } from "./SelectedProductStore";
import { ISelectedTransactionStore, SelectedTransactionStore } from "./SelectedTransactionStore";
import { ISelectedWalletStore, SelectedWalletStore } from "./SelectedWalletStore";
import { ISelectedWarehouseStore, SelectedWarehouseStore } from "./SelectedWarehouseStore";
import { ISettingsStore, SettingsStore } from "./SettingsStore";
import { IStockAdjustmentStore, StockAdjustmentStore } from "./StockAdjustmentStore";
import { TemplateStore } from "./TemplateStore";
import { ITransactionStore, TransactionStore } from "./TransactionStore";
import { ITransferStore, TransferStore } from "./TransferStore";
import { IWalletStore, WalletStore } from "./WalletStore";
import { IWarehouseStore, WarehouseStore } from "./WarehouseStore";

/**
 * Composes every store. Notification, auth and connectivity live for the whole
 * tab; everything holding business data is per-session and rebuilt by `reset()`
 * on logout, so the next sign-in in the same tab never sees the previous
 * user's or business's data (frontend-4).
 */
export class RootStore {
	notificationStore: NotificationStore;
	categoryStore!: ICategoryStore;
	productStore!: IProductStore;
	partnerStore!: IPartnerStore;
	partnerLedgerStore!: IPartnerLedgerStore;
	templateStore!: TemplateStore;
	transactionStore!: ITransactionStore;
	selectedTransactionStore!: ISelectedTransactionStore;
	selectedProductStore!: ISelectedProductStore;
	paymentStore!: IPaymentStore;
	selectedPaymentStore!: ISelectedPaymentStore;
	warehouseStore!: IWarehouseStore;
	selectedWarehouseStore!: ISelectedWarehouseStore;
	stockAdjustmentStore!: IStockAdjustmentStore;
	transferStore!: ITransferStore;
	movementSourceStore!: IMovementSourceStore;
	orderStore!: OrderStore;
	authStore: AuthStore;
	employeeStore!: IEmployeeStore;
	selectedEmployeeStore!: ISelectedEmployeeStore;
	payrollStore!: IPayrollStore;
	walletStore!: IWalletStore;
	selectedWalletStore!: ISelectedWalletStore;
	debtStore!: IDebtStore;
	dashboardStore!: IDashboardStore;
	onboardingStore!: IOnboardingStore;
	settingsStore!: ISettingsStore;
	invoicePrintStore!: IInvoicePrintStore;
	debtReminderStore!: IDebtReminderStore;
	connectivityStore: IConnectivityStore;

	constructor() {
		this.notificationStore = new NotificationStore();
		this.authStore = new AuthStore();
		// Registers the ConnectivityBridge reporters used by the http error
		// interceptor — construct it so the wiring exists before any request.
		this.connectivityStore = new ConnectivityStore(this.notificationStore);
		this.createDataStores();
	}

	/** Drops every per-session store (logout) — see the class note. */
	reset(): void {
		this.createDataStores();
	}

	private createDataStores(): void {
		this.categoryStore = new CategoryStore(this.notificationStore);
		this.productStore = new ProductStore(this.notificationStore);
		this.partnerStore = new PartnerStore(this.notificationStore);
		this.partnerLedgerStore = new PartnerLedgerStore(this.notificationStore);
		this.templateStore = new TemplateStore(this.notificationStore);
		this.transactionStore = new TransactionStore(this.notificationStore);
		this.selectedTransactionStore = new SelectedTransactionStore(this.notificationStore);
		this.selectedProductStore = new SelectedProductStore(this.notificationStore);
		this.paymentStore = new PaymentStore(this.notificationStore);
		this.selectedPaymentStore = new SelectedPaymentStore(this.notificationStore);
		this.warehouseStore = new WarehouseStore(this.notificationStore);
		this.selectedWarehouseStore = new SelectedWarehouseStore(this.notificationStore);
		this.stockAdjustmentStore = new StockAdjustmentStore(this.notificationStore);
		this.transferStore = new TransferStore(this.notificationStore);
		this.movementSourceStore = new MovementSourceStore(this.notificationStore);
		this.orderStore = new OrderStore(this.notificationStore);
		this.employeeStore = new EmployeeStore(this.notificationStore);
		this.selectedEmployeeStore = new SelectedEmployeeStore(
			this.employeeStore,
			this.notificationStore,
		);
		this.payrollStore = new PayrollStore(this.notificationStore);
		this.walletStore = new WalletStore(this.notificationStore);
		this.selectedWalletStore = new SelectedWalletStore(this.notificationStore);
		this.debtStore = new DebtStore(this.notificationStore);
		this.dashboardStore = new DashboardStore(this.notificationStore);
		this.onboardingStore = new OnboardingStore(this.authStore);
		this.settingsStore = new SettingsStore(this.notificationStore);
		this.invoicePrintStore = new InvoicePrintStore(this.notificationStore);
		this.debtReminderStore = new DebtReminderStore(this.settingsStore, this.notificationStore);
	}
}

export const rootStore = new RootStore();
export type RootStoreType = typeof rootStore;
