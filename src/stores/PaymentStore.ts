import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentDirection,
	PaymentFormData,
	PaymentRecord,
	PaymentType,
} from "../models/payment";
import PaymentApi from "../services/api/PaymentApi";
import { analytics } from "../services/telemetry";
import { NotificationStore } from "./NotificationStore";

export type PaymentTypeFilter = PaymentType | "all";

/** Summary stat cards: income / expense totals + count over the filtered view. */
export type PaymentSummary = {
	income: number;
	expense: number;
	count: number;
};

export interface IPaymentStore {
	allPayments: Loadable<PaymentRecord[]>;
	filteredPayments: Loadable<PaymentRecord[]>;
	summary: PaymentSummary;
	walletOptions: { id: number; name: string }[];

	searchTerm: string;
	typeFilter: PaymentTypeFilter;
	walletFilter: number | "all";
	directionFilter: PaymentDirection | "all";
	isSaving: boolean;
	isCreateOpen: boolean;

	formData: Loadable<PaymentFormData>;
	outstanding: Loadable<OutstandingTransaction[]>;

	getAll(): Promise<void>;
	getFormData(): Promise<void>;
	loadOutstanding(partnerId: number): Promise<void>;
	clearOutstanding(): void;
	create(request: CreatePaymentRecordRequest): Promise<PaymentRecord | null>;

	setSearch(term: string): void;
	setTypeFilter(type: PaymentTypeFilter): void;
	setWalletFilter(walletId: number | "all"): void;
	setDirectionFilter(direction: PaymentDirection): void;

	openCreate(): void;
	closeCreate(): void;
}

export class PaymentStore implements IPaymentStore {
	private readonly notificationStore: NotificationStore;

	allPayments: Loadable<PaymentRecord[]> = "loading";
	formData: Loadable<PaymentFormData> = "loading";
	outstanding: Loadable<OutstandingTransaction[]> = "loading";

	searchTerm = "";
	typeFilter: PaymentTypeFilter = "all";
	walletFilter: number | "all" = "all";
	directionFilter: PaymentDirection | "all" = "all";
	isSaving = false;
	isCreateOpen = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/**
	 * Type + wallet + search filtered, but NOT the direction toggle — the scope the
	 * summary cards total over, so the Приход / Расход cards stay stable references
	 * you can toggle the table by (PAY-3).
	 */
	private get scopedPayments(): Loadable<PaymentRecord[]> {
		if (this.allPayments === "loading") {
			return "loading";
		}

		let rows = this.allPayments;

		if (this.typeFilter !== "all") {
			rows = rows.filter((p) => p.type === this.typeFilter);
		}
		if (this.walletFilter !== "all") {
			rows = rows.filter((p) => p.walletId === this.walletFilter);
		}
		if (this.searchTerm.trim()) {
			rows = rows.filter(
				(p) =>
					matchesSearch(p.number, this.searchTerm) ||
					matchesSearch(p.partnerName, this.searchTerm) ||
					matchesSearch(p.employeeName, this.searchTerm),
			);
		}

		return rows;
	}

	/** The table view — the scoped set plus the Приход / Расход direction toggle. */
	get filteredPayments(): Loadable<PaymentRecord[]> {
		const rows = this.scopedPayments;
		if (rows === "loading") {
			return "loading";
		}
		return this.directionFilter === "all"
			? rows
			: rows.filter((p) => p.direction === this.directionFilter);
	}

	/** Income / expense / count over the scoped view (excludes the direction toggle). */
	get summary(): PaymentSummary {
		const rows = this.scopedPayments;
		if (rows === "loading") {
			return { income: 0, expense: 0, count: 0 };
		}
		return rows.reduce(
			(acc, p) => ({
				income: acc.income + (p.direction === "Income" ? p.amount : 0),
				expense: acc.expense + (p.direction === "Expense" ? p.amount : 0),
				count: acc.count + 1,
			}),
			{ income: 0, expense: 0, count: 0 },
		);
	}

	/** Distinct wallets seen across all payments — drives the wallet filter. */
	get walletOptions(): { id: number; name: string }[] {
		if (this.allPayments === "loading") {
			return [];
		}
		const seen = new Map<number, string>();
		for (const p of this.allPayments) {
			if (!seen.has(p.walletId)) {
				seen.set(p.walletId, p.walletName);
			}
		}
		return [...seen.entries()].map(([id, name]) => ({ id, name }));
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allPayments = "loading"));

		const result = await tryRun(() => PaymentApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payment.error.getAll"));
		}

		runInAction(() => (this.allPayments = result.status === "success" ? result.data : []));
	}

	async getFormData(): Promise<void> {
		const result = await tryRun(() => PaymentApi.getFormData());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payment.error.formData"));
		}

		runInAction(() => {
			this.formData =
				result.status === "success" ? result.data : { partners: [], employees: [], wallets: [] };
		});
	}

	async loadOutstanding(partnerId: number): Promise<void> {
		runInAction(() => (this.outstanding = "loading"));

		const result = await tryRun(() => PaymentApi.getOutstanding(partnerId));

		runInAction(() => {
			this.outstanding = result.status === "success" ? result.data : [];
		});
	}

	clearOutstanding(): void {
		this.outstanding = "loading";
	}

	async create(request: CreatePaymentRecordRequest): Promise<PaymentRecord | null> {
		const result = await withSaving(this, () => PaymentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("payment.error.create"));
			return null;
		}

		runInAction(() => {
			if (this.allPayments !== "loading") {
				this.allPayments = [result.data, ...this.allPayments];
			}
			// Reference figures (advance / outstanding / wallet balance) moved —
			// refetch form data lazily next time the modal opens.
			this.formData = "loading";
		});

		this.closeCreate();
		this.notificationStore.success(
			i18next.t("payment.success.create", { number: result.data.number }),
		);
		analytics.capture("payment_recorded", {
			payment_type: result.data.type,
			direction: result.data.direction,
			amount: result.data.amount,
			// Only a TransactionSettlement allocation means a debt was actually
			// settled — AdvanceCredit / ChangeReturn allocations exist too and must
			// not count (matches the POS event's `settledSum > 0`).
			has_settlement: result.data.allocations.some(
				(a) => a.allocationType === "TransactionSettlement",
			),
			wallet_type: result.data.walletType,
		});
		return result.data;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setTypeFilter(type: PaymentTypeFilter): void {
		this.typeFilter = type;
	}

	setWalletFilter(walletId: number | "all"): void {
		this.walletFilter = walletId;
	}

	/** Toggle the direction filter — clicking the active direction clears it (PAY-3). */
	setDirectionFilter(direction: PaymentDirection): void {
		this.directionFilter = this.directionFilter === direction ? "all" : direction;
	}

	openCreate(): void {
		this.isCreateOpen = true;
	}

	closeCreate(): void {
		this.isCreateOpen = false;
	}
}

export default PaymentStore;
