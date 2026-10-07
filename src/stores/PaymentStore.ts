import { isReady, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { ALL_DATES, DateRangeValue, filterByDateRange } from "utils/dateRange";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";
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

/** Payments per direction under the other filters — the direction cards' counts. */
export type PaymentDirectionCounts = {
	all: number;
	income: number;
	expense: number;
};

export type PaymentDirectionFilter = PaymentDirection | "all";

export interface IPaymentStore {
	allPayments: Loadable<PaymentRecord[]>;
	filteredPayments: Loadable<PaymentRecord[]>;
	directionCounts: PaymentDirectionCounts;
	walletOptions: { id: number; name: string }[];

	searchTerm: string;
	typeFilter: PaymentTypeFilter;
	walletFilter: number | "all";
	directionFilter: PaymentDirectionFilter;
	dateRange: DateRangeValue;
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
	setDirectionFilter(direction: PaymentDirectionFilter): void;
	setDateRange(range: DateRangeValue): void;

	openCreate(): void;
	closeCreate(): void;
}

export class PaymentStore implements IPaymentStore {
	private readonly notificationStore: NotificationStore;
	/** Latest-only: switching partner must never show the previous partner's debts. */
	private readonly outstandingLoads = new LoadSequence();
	private readonly formDataLoads = new LoadSequence();

	allPayments: Loadable<PaymentRecord[]> = "loading";
	formData: Loadable<PaymentFormData> = "loading";
	outstanding: Loadable<OutstandingTransaction[]> = "loading";

	searchTerm = "";
	typeFilter: PaymentTypeFilter = "all";
	walletFilter: number | "all" = "all";
	directionFilter: PaymentDirectionFilter = "all";
	dateRange: DateRangeValue = ALL_DATES;
	isSaving = false;
	isCreateOpen = false;
	/**
	 * Set by a create: advances / open debts / wallet balances moved, so the next
	 * open refetches. The loaded data itself stays until then — dropping it while
	 * the dialog is still closing left its selects holding out-of-range values.
	 */
	private formDataStale = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/**
	 * Period + type + wallet + search filtered, but NOT the direction — the scope
	 * the direction cards count over, so each card says how many rows picking it
	 * would show (PAY-3). The period filters client-side like every list: the full
	 * list is loaded anyway.
	 */
	private get scopedPayments(): Loadable<PaymentRecord[]> {
		if (!isReady(this.allPayments)) {
			return this.allPayments;
		}

		let rows = filterByDateRange(this.allPayments, this.dateRange, (p) => p.date);

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

	/** The table view — the scoped set narrowed to the picked direction card. */
	get filteredPayments(): Loadable<PaymentRecord[]> {
		const rows = this.scopedPayments;
		if (!isReady(rows)) {
			return rows;
		}
		return this.directionFilter === "all"
			? rows
			: rows.filter((p) => p.direction === this.directionFilter);
	}

	/**
	 * Loaded payments per direction under the other filters. The list endpoint
	 * serves no counts and the filters run client-side, so these count its rows.
	 */
	get directionCounts(): PaymentDirectionCounts {
		const rows = this.scopedPayments;
		if (!isReady(rows)) {
			return { all: 0, income: 0, expense: 0 };
		}
		const count = (direction: PaymentDirection) =>
			rows.filter((p) => p.direction === direction).length;
		return { all: rows.length, income: count("Income"), expense: count("Expense") };
	}

	/** Distinct wallets seen across all payments — drives the wallet filter. */
	get walletOptions(): { id: number; name: string }[] {
		if (!isReady(this.allPayments)) {
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

		runInAction(() => (this.allPayments = toLoadable(result)));
	}

	async getFormData(): Promise<void> {
		const isCurrent = this.formDataLoads.begin();
		runInAction(() => (this.formData = "loading"));

		const result = await tryRun(() => PaymentApi.getFormData());
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.formData = toLoadable(result)));
	}

	/** A failed fetch is an error state, never «no open debts» (which would book an advance). */
	async loadOutstanding(partnerId: number): Promise<void> {
		const isCurrent = this.outstandingLoads.begin();
		runInAction(() => (this.outstanding = "loading"));

		const result = await tryRun(() => PaymentApi.getOutstanding(partnerId));
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.outstanding = toLoadable(result)));
	}

	clearOutstanding(): void {
		this.outstandingLoads.invalidate();
		this.outstanding = "loading";
	}

	async create(request: CreatePaymentRecordRequest): Promise<PaymentRecord | null> {
		const result = await withSaving(this, () => PaymentApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.notifyApiError(result, "payment.error.create");
			return null;
		}

		runInAction(() => {
			if (isReady(this.allPayments)) {
				this.allPayments = [result.data, ...this.allPayments];
			}
			this.formDataStale = true;
		});

		this.closeCreate();
		this.notificationStore.success(
			i18next.t("payment.success.create", {
				number: formatOptionalNumber(result.data.number, i18next.t("common.noNumberInline")),
				amount: formatCurrency(result.data.amount),
			}),
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

	/**
	 * A direction-card pick (the page's one direction filter): picking the active
	 * Приход / Расход again goes back to «Все платежи» (PAY-3).
	 */
	setDirectionFilter(direction: PaymentDirectionFilter): void {
		this.directionFilter = this.directionFilter === direction ? "all" : direction;
	}

	setDateRange(range: DateRangeValue): void {
		this.dateRange = range;
	}

	openCreate(): void {
		if (this.formDataStale) {
			this.formDataStale = false;
			this.formDataLoads.invalidate();
			this.formData = "loading";
		}
		this.isCreateOpen = true;
	}

	closeCreate(): void {
		this.isCreateOpen = false;
	}
}

export default PaymentStore;
