import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { withSaving } from "helpers/WithSaving";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import {
	CreateRefundRequest,
	CreateTransactionEntryRequest,
	TransactionRecord,
	TransactionStatus,
} from "models/transaction";
import TransactionApi from "services/api/TransactionApi";
import { analytics } from "services/telemetry";
import { formatEntityId } from "utils/formatEntityId";
import { matchesSearch } from "utils/stringUtils";
import { DIRECTION_TYPES, isRefundType, TransactionDirection } from "utils/transactionUtils";

import { NotificationStore } from "./NotificationStore";

export type StatusFilter = "all" | TransactionStatus;
export type DateRangeFilter = "all" | "7" | "30" | "90";

export type TransactionDialogMode =
	| { kind: "refund"; transaction: TransactionRecord }
	| { kind: "none" };

const MS_PER_DAY = 86_400_000;

export interface ITransactionStore {
	allTransactions: Loadable<TransactionRecord[]>;
	salesFeed: Loadable<TransactionRecord[]>;
	suppliesFeed: Loadable<TransactionRecord[]>;
	isSaving: boolean;

	searchTerm: string;
	statusFilter: StatusFilter;
	dateRange: DateRangeFilter;
	dialogMode: TransactionDialogMode;

	getAll(): Promise<void>;
	createTransactionEntry(request: CreateTransactionEntryRequest): Promise<TransactionRecord | null>;
	createRefund(
		transaction: TransactionRecord,
		request: CreateRefundRequest,
	): Promise<TransactionRecord | null>;

	setSearchTerm(term: string): void;
	setStatusFilter(status: StatusFilter): void;
	setDateRange(range: DateRangeFilter): void;
	resetFilters(): void;

	openRefund(transaction: TransactionRecord): void;
	closeDialog(): void;
}

export class TransactionStore implements ITransactionStore {
	private readonly notificationStore: NotificationStore;

	allTransactions: Loadable<TransactionRecord[]> = "loading";
	searchTerm = "";
	statusFilter: StatusFilter = "all";
	dateRange: DateRangeFilter = "all";
	isSaving = false;
	dialogMode: TransactionDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get salesFeed(): Loadable<TransactionRecord[]> {
		return this.feedFor("Sale");
	}

	get suppliesFeed(): Loadable<TransactionRecord[]> {
		return this.feedFor("Supply");
	}

	private feedFor(direction: TransactionDirection): Loadable<TransactionRecord[]> {
		if (this.allTransactions === "loading") {
			return "loading";
		}

		const types = DIRECTION_TYPES[direction];
		let list = this.allTransactions.filter((tx) => types.includes(tx.type));

		if (this.dateRange !== "all") {
			const days = Number(this.dateRange);
			list = list.filter((tx) => {
				const diff = (Date.now() - new Date(tx.date).getTime()) / MS_PER_DAY;
				return diff <= days;
			});
		}

		// Refunds carry no payment status — a status filter hides them (design parity).
		if (this.statusFilter !== "all") {
			list = list.filter((tx) => !isRefundType(tx.type) && tx.status === this.statusFilter);
		}

		const term = this.searchTerm.trim();
		if (term) {
			list = list.filter(
				(tx) =>
					matchesSearch(tx.transactionNumber ?? String(tx.id), term) ||
					matchesSearch(tx.partnerName, term) ||
					matchesSearch(tx.originalTransactionNumber, term),
			);
		}

		// Newest first; a refund sits just above its original on the same day.
		return list.slice().sort((a, b) => {
			const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
			if (diff !== 0) {
				return diff;
			}
			return isRefundType(a.type) === isRefundType(b.type) ? 0 : isRefundType(a.type) ? -1 : 1;
		});
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allTransactions = "loading"));

		const result = await tryRun(() => TransactionApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("transactions.errors.getAll"));
		}

		runInAction(() => (this.allTransactions = result.status === "success" ? result.data : []));
	}

	/**
	 * Redesigned POS New Sale / New Supply create. Posts the JSON v1 contract; on
	 * success the created transaction is prepended to the feed and returned for
	 * navigation. Self-contained mock: stock, partner balance and wallet balance
	 * are not mutated (known limitation, like refunds/transfers).
	 */
	async createTransactionEntry(
		request: CreateTransactionEntryRequest,
	): Promise<TransactionRecord | null> {
		const result = await withSaving(this, () => TransactionApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t(`transaction.new.error.${request.type}`));
			return null;
		}

		runInAction(() => {
			if (this.allTransactions !== "loading") {
				this.allTransactions = [result.data, ...this.allTransactions];
			}
		});
		this.notificationStore.success(
			i18next.t(`transaction.new.success.${request.type}`, {
				number: result.data.transactionNumber,
			}),
		);
		return result.data;
	}

	async createRefund(
		transaction: TransactionRecord,
		request: CreateRefundRequest,
	): Promise<TransactionRecord | null> {
		// A refund is created through the same typed POST /api/transactions; the type
		// discriminates a refund of a sale vs a supply (the original is never a refund).
		const refundType = transaction.type === "Supply" ? "SupplyRefund" : "SaleRefund";
		// The backend requires the warehouse (stock returns to the original's warehouse).
		// The detail record carries warehouseId; bail out clearly if it is somehow absent.
		const warehouseId = transaction.warehouseId;
		if (warehouseId == null) {
			this.notificationStore.error(i18next.t("transaction.refund.error"));
			return null;
		}
		const result = await withSaving(this, () =>
			TransactionApi.create({
				type: refundType,
				partnerId: transaction.partnerId,
				warehouseId,
				originalTransactionId: transaction.id,
				refundReason: request.reason,
				lines: request.lines,
			}),
		);

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("transaction.refund.error"));
			return null;
		}

		runInAction(() => {
			if (this.allTransactions !== "loading") {
				this.allTransactions = [result.data, ...this.allTransactions];
			}
		});
		this.closeDialog();
		this.notificationStore.success(
			i18next.t("transaction.refund.success", {
				number: formatEntityId(transaction.transactionNumber ?? transaction.id),
			}),
		);
		analytics.capture("transaction_refunded", {
			direction: transaction.type === "Supply" ? "Supply" : "Sale",
			line_count: request.lines.length,
			total: request.lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0),
			original_id: transaction.id,
		});
		return result.data;
	}

	setSearchTerm(term: string): void {
		this.searchTerm = term;
	}

	setStatusFilter(status: StatusFilter): void {
		this.statusFilter = status;
	}

	setDateRange(range: DateRangeFilter): void {
		this.dateRange = range;
	}

	resetFilters(): void {
		this.searchTerm = "";
		this.statusFilter = "all";
		this.dateRange = "all";
	}

	openRefund(transaction: TransactionRecord): void {
		this.dialogMode = { kind: "refund", transaction };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}
}
