import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { DashboardMetrics, TimeSeriesPoint } from "models/dashboard";
import { Partner } from "models/partner";
import { Payment } from "models/payment";
import { TransactionRecord, TransactionType } from "models/transaction";
import PartnerApi from "services/api/PartnerApi";
import TransactionApi from "services/api/TransactionApi";
import { DateFilter, materialise, PresetOption } from "utils/dateFilterUtils";

import { NotificationStore } from "./NotificationStore";
import { IPartnerStore } from "./PartnerStore";

const DATE_FORMAT = "yyyy-MM-dd";

export interface ISelectedPartnerStore {
	// client‐side controls
	filteredTransactions: Loadable<TransactionRecord[]>;
	openTransactions: Loadable<TransactionRecord[]>;
	sales: Loadable<TransactionRecord[]>;
	supplies: Loadable<TransactionRecord[]>;
	payments: Loadable<Payment[]>;
	payableDebts: Loadable<TransactionRecord[]>;
	receivableDebts: Loadable<TransactionRecord[]>;
	dashboardMetrics: Loadable<DashboardMetrics>;

	/* current filter */
	readonly dateFilter: DateFilter;

	// actions
	getTransactions(type: TransactionType | null): Promise<void>;
	getPayments(): Promise<void>;

	// setters for filters & sorting
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;
}

export class SelectedPartnerStore implements ISelectedPartnerStore {
	private selectedPartner: Partner | null = null;
	private readonly partnerStore: IPartnerStore;
	private readonly notificationStore: NotificationStore;

	private allTransactions: Loadable<TransactionRecord[]> = [];
	private allPayments: Loadable<Payment[]> = [];

	openTransactions: Loadable<TransactionRecord[]> = [];
	dateFilter: DateFilter = { type: "preset", preset: "week" };

	constructor(partnerStore: IPartnerStore, notificationStore: NotificationStore) {
		this.partnerStore = partnerStore;
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	get filteredTransactions(): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		return this.applyFilter(this.allTransactions);
	}

	get sales(): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const sales = this.allTransactions.filter((el) => el.type === "Sale");
		return this.applyFilter(sales);
	}

	get supplies(): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const supplies = this.allTransactions.filter((el) => el.type === "Supply");
		return this.applyFilter(supplies);
	}

	get payments(): Loadable<Payment[]> {
		return this.filterPayments(this.allPayments);
	}

	get payableDebts(): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		return this.allTransactions.filter((el) => el.status !== "Open");
	}

	get receivableDebts(): Loadable<TransactionRecord[]> {
		if (this.openTransactions === "loading") {
			return "loading";
		}

		return this.openTransactions.filter((el) => el.type === "Supply" || el.type === "SaleRefund");
	}

	get dashboardMetrics(): Loadable<DashboardMetrics> {
		const filtered = this.applyFilter(this.allTransactions);

		if (filtered === "loading") {
			return "loading";
		}

		const sales = filtered.filter((t) => t.type === "Sale");
		const supplies = filtered.filter((t) => t.type === "Supply");
		const refunds = filtered.filter((t) => t.type === "SaleRefund" || t.type === "SupplyRefund");

		const totalSales = sales.reduce((sum, t) => sum + t.totalDue, 0);
		const totalSupplies = supplies.reduce((sum, t) => sum + t.totalDue, 0);
		const netChange = totalSales - totalSupplies;
		const overdueCount = filtered.filter((t) => t.status === "Overdue").length;
		const transactionCount = sales.length + supplies.length;
		const refundCount = refunds.length;

		let outstandingCount = 0;
		if (this.openTransactions !== "loading") {
			const openFiltered = this.applyFilter(this.openTransactions);
			if (openFiltered !== "loading") {
				outstandingCount = openFiltered.length;
			}
		}

		const { from, to } = materialise(this.dateFilter);
		const endDate = to ?? new Date();
		let startDate: Date;

		if (this.dateFilter.type === "preset" && this.dateFilter.preset === "week") {
			startDate = subDays(endDate, 6);
		} else {
			const dates = filtered
				.map((t) => (typeof t.date === "string" ? new Date(t.date) : t.date))
				.sort((a, b) => a.getTime() - b.getTime());
			startDate = from ?? dates[0] ?? endDate;
		}

		if (startDate > endDate) {
			startDate = endDate;
		}

		const days = eachDayOfInterval({ start: startDate, end: endDate });

		const salesOverTime: TimeSeriesPoint[] = days.map((day) => {
			const dayTotal = sales
				.filter((t) => {
					const d = typeof t.date === "string" ? new Date(t.date) : t.date;
					return isSameDay(d, day);
				})
				.reduce((sum, t) => sum + t.totalDue, 0);
			return { date: format(day, DATE_FORMAT), value: dayTotal };
		});

		const suppliesOverTime: TimeSeriesPoint[] = days.map((day) => {
			const dayTotal = supplies
				.filter((t) => {
					const d = typeof t.date === "string" ? new Date(t.date) : t.date;
					return isSameDay(d, day);
				})
				.reduce((sum, t) => sum + t.totalDue, 0);
			return { date: format(day, DATE_FORMAT), value: dayTotal };
		});

		const saleRefundsOverTime: TimeSeriesPoint[] = days.map((day) => {
			const dayTotal = filtered
				.filter((t) => t.type === "SaleRefund")
				.filter((t) => {
					const d = typeof t.date === "string" ? new Date(t.date) : t.date;
					return isSameDay(d, day);
				})
				.reduce((sum, t) => sum + t.totalDue, 0);
			return { date: format(day, DATE_FORMAT), value: dayTotal };
		});

		const supplyRefundsOverTime: TimeSeriesPoint[] = days.map((day) => {
			const dayTotal = filtered
				.filter((t) => t.type === "SupplyRefund")
				.filter((t) => {
					const d = typeof t.date === "string" ? new Date(t.date) : t.date;
					return isSameDay(d, day);
				})
				.reduce((sum, t) => sum + t.totalDue, 0);
			return { date: format(day, DATE_FORMAT), value: dayTotal };
		});

		const transactionsOverTime: TimeSeriesPoint[] = days.map((day) => {
			const count = filtered.filter(
				(t) =>
					(t.type === "Sale" || t.type === "Supply") &&
					isSameDay(typeof t.date === "string" ? new Date(t.date) : t.date, day),
			).length;
			return { date: format(day, DATE_FORMAT), value: count };
		});

		// 2. REFUNDS count per day (SaleRefund + SupplyRefund)
		const refundsOverTime: TimeSeriesPoint[] = days.map((day) => {
			const count = filtered.filter(
				(t) =>
					(t.type === "SaleRefund" || t.type === "SupplyRefund") &&
					isSameDay(typeof t.date === "string" ? new Date(t.date) : t.date, day),
			).length;
			return { date: format(day, DATE_FORMAT), value: count };
		});

		let openList: TransactionRecord[] = [];
		if (this.openTransactions !== "loading") {
			const of = this.applyFilter(this.openTransactions);
			if (of !== "loading") openList = of;
		}
		const debtsOverTime: TimeSeriesPoint[] = days.map((day) => {
			const count = openList.filter((t) =>
				isSameDay(typeof t.date === "string" ? new Date(t.date) : t.date, day),
			).length;
			return { date: format(day, DATE_FORMAT), value: count };
		});

		return {
			totalSales,
			totalSupplies,
			netChange,
			overdueCount,
			salesOverTime,
			suppliesOverTime,
			transactionCount,
			refundCount,
			outstandingCount,
			saleRefundsOverTime,
			supplyRefundsOverTime,
			transactionsOverTime,
			refundsOverTime,
			debtsOverTime,
		};
	}

	setPreset(preset: PresetOption) {
		this.dateFilter = { type: "preset", preset };
	}

	setCustom(from: Date, to: Date) {
		this.dateFilter = { type: "custom", from, to };
	}

	async getTransactions(type: TransactionType | null = null): Promise<void> {
		if (this.allTransactions === "loading" || !this.selectedPartner) {
			return;
		}

		const partnerId = this.selectedPartner.id;
		runInAction(() => (this.allTransactions = "loading"));

		const result = await tryRun(() => TransactionApi.getAll({ partnerId, type }));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partner.error.getTransactions"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allTransactions = data));
	}

	async getPayments(): Promise<void> {
		if (this.allPayments === "loading" || !this.selectedPartner) {
			return;
		}

		runInAction(() => (this.allPayments = "loading"));
		const result = await tryRun(() => PartnerApi.getPayments(this.selectedPartner!.id));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partner.error.getPayments"));
		}

		const data = result.status === "fail" ? [] : result.data;
		runInAction(() => (this.allPayments = data));
	}

	private applyFilter(data: Loadable<TransactionRecord[]>): Loadable<TransactionRecord[]> {
		if (data === "loading") {
			return "loading";
		}

		return data.filter((transaction) => this.isWithin(transaction.date, this.dateFilter));
	}

	private filterPayments(data: Loadable<Payment[]>): Loadable<Payment[]> {
		if (data === "loading") {
			return "loading";
		}

		return data.filter((payment) => this.isWithin(payment.date, this.dateFilter));
	}

	private isWithin(dateIso: string | Date, filter: DateFilter): boolean {
		const { from, to } = materialise(filter);
		const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;

		if (from && date < from) {
			return false;
		}

		if (to && date > to) {
			return false;
		}

		return true;
	}

	private async getOpenTransactions(partnerId: number) {
		if (this.openTransactions === "loading") {
			return;
		}

		runInAction(() => (this.openTransactions = "loading"));
		const result = await tryRun(() => TransactionApi.getOpenTransactions(partnerId));

		if (result.status === "fail") {
			this.notificationStore.error(translate("partner.error.getDebts"));
			return;
		}

		runInAction(() => (this.openTransactions = result.data));
	}

	private registerReactions() {
		reaction(
			() => this.partnerStore.selectedPartner,
			(partner) => {
				runInAction(() => {
					this.selectedPartner = partner;
					this.allTransactions = [];
					this.allPayments = [];
					this.dateFilter = { type: "preset", preset: "week" };
				});
				if (partner && this.partnerStore.dialogMode.kind === "details") {
					this.getTransactions();
					this.getPayments();
					this.getOpenTransactions(partner.id);
				}
			},
			{ fireImmediately: true },
		);
	}
}
