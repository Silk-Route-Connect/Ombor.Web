import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Partner } from "models/partner";
import { Payment } from "models/payment";
import { TransactionRecord, TransactionType } from "models/transaction";
import PartnerApi from "services/api/PartnerApi";
import TransactionApi from "services/api/TransactionApi";
import { DateFilter, materialise, PresetOption } from "utils/dateFilterUtils";

import { NotificationStore } from "./NotificationStore";
import { IPartnerStore } from "./PartnerStore";

export interface ISelectedPartnerStore {
	// client‐side controls
	filteredTransactions: Loadable<TransactionRecord[]>;
	openTransactions: Loadable<TransactionRecord[]>;
	sales: Loadable<TransactionRecord[]>;
	supplies: Loadable<TransactionRecord[]>;
	payments: Loadable<Payment[]>;
	payableDebts: Loadable<TransactionRecord[]>;
	receivableDebts: Loadable<TransactionRecord[]>;

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

	private allTransactions: Loadable<TransactionRecord[]> = [];
	private allPayments: Loadable<Payment[]> = [];
	openTransactions: Loadable<TransactionRecord[]> = [];
	dateFilter: DateFilter = { type: "preset", preset: "week" };

	constructor(
		private readonly partnerStore: IPartnerStore,
		private readonly notificationStore: NotificationStore,
	) {
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
		if (this.openTransactions === "loading") {
			return "loading";
		}

		return this.openTransactions.filter((el) => el.type === "Sale" || el.type === "SupplyRefund");
	}

	get receivableDebts(): Loadable<TransactionRecord[]> {
		if (this.openTransactions === "loading") {
			return "loading";
		}

		return this.openTransactions.filter((el) => el.type === "Supply" || el.type === "SaleRefund");
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
		const d = typeof dateIso === "string" ? new Date(dateIso) : dateIso;

		if (from && d < from) return false;
		if (to && d > to) return false;
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
