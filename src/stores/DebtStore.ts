import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { Debt, DebtDirection, DebtTransactionType } from "../models/debt";
import DebtApi from "../services/api/DebtApi";
import { NotificationStore } from "./NotificationStore";

export type DebtTab = "partners" | "transactions";
export type DebtDirectionFilter = DebtDirection | "all";
export type DebtAgeBucket = "all" | "0-7" | "8-30" | "31-60" | "60+";
/** Initial-sort seed for the transactions table (column headers own ad-hoc sorting). */
export type DebtTxPresetSort = "remaining" | "age";

/** Top-of-page summary — totals over ALL debts (not the filtered view). */
export type DebtSummary = {
	receivable: number;
	receivableCount: number;
	payable: number;
	payableCount: number;
	overdue: number;
	overdueCount: number;
	/** Receivables − payables. */
	net: number;
	totalCount: number;
};

/** A by-partner aggregate row. */
export type DebtPartnerGroup = {
	/** Row id for the shared DataTable — the partner id (one group per partner). */
	id: number;
	partnerId: number;
	partnerName: string;
	partnerCompany: string | null;
	direction: DebtDirection;
	transactionType: DebtTransactionType;
	/** Signed total: positive = they owe us, negative = we owe them. */
	sum: number;
	count: number;
	/** ISO date of the oldest unpaid transaction. */
	oldestDate: string;
	overdueCount: number;
};

const AGE_PREDICATES: Record<DebtAgeBucket, (d: Debt) => boolean> = {
	all: () => true,
	"0-7": (d) => d.ageDays <= 7,
	"8-30": (d) => d.ageDays >= 8 && d.ageDays <= 30,
	"31-60": (d) => d.ageDays >= 31 && d.ageDays <= 60,
	"60+": (d) => d.ageDays > 60,
};

export interface IDebtStore {
	allDebts: Loadable<Debt[]>;
	summary: DebtSummary;
	partnerGroups: DebtPartnerGroup[];
	transactionRows: Debt[];

	tab: DebtTab;
	searchTerm: string;
	ageBucket: DebtAgeBucket;
	directionFilter: DebtDirectionFilter;
	/** Seeds the transactions table's initial sort (set by the card presets). */
	txPresetSort: DebtTxPresetSort;
	/** Bumped on every card click so the table re-seeds even for the same preset. */
	txPresetNonce: number;
	onlyOverdue: boolean;

	getAll(): Promise<void>;
	setTab(tab: DebtTab): void;
	setSearch(term: string): void;
	setAgeBucket(bucket: DebtAgeBucket): void;
	setDirectionFilter(dir: DebtDirectionFilter): void;
	setOnlyOverdue(value: boolean): void;
	clearFilters(): void;
	/** A summary-card click jumps to the transactions tab with a preset filter. */
	applyCard(card: "receivable" | "payable" | "overdue"): void;
}

export class DebtStore implements IDebtStore {
	private readonly notificationStore: NotificationStore;

	allDebts: Loadable<Debt[]> = "loading";
	tab: DebtTab = "partners";
	searchTerm = "";
	ageBucket: DebtAgeBucket = "all";
	directionFilter: DebtDirectionFilter = "all";
	txPresetSort: DebtTxPresetSort = "remaining";
	txPresetNonce = 0;
	onlyOverdue = false;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allDebts = "loading"));

		const result = await tryRun(() => DebtApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("debt.error.getAll"));
		}

		runInAction(() => (this.allDebts = result.status === "success" ? result.data : []));
	}

	/** Totals over every debt — the summary cards are a global snapshot. */
	get summary(): DebtSummary {
		if (this.allDebts === "loading") {
			return {
				receivable: 0,
				receivableCount: 0,
				payable: 0,
				payableCount: 0,
				overdue: 0,
				overdueCount: 0,
				net: 0,
				totalCount: 0,
			};
		}
		const recv = this.allDebts.filter((d) => d.direction === "Receivable");
		const payb = this.allDebts.filter((d) => d.direction === "Payable");
		const overdue = this.allDebts.filter((d) => d.overdueDays > 0);
		const receivable = recv.reduce((s, d) => s + d.remaining, 0);
		const payable = payb.reduce((s, d) => s + d.remaining, 0);
		return {
			receivable,
			receivableCount: recv.length,
			payable,
			payableCount: payb.length,
			overdue: overdue.reduce((s, d) => s + d.remaining, 0),
			overdueCount: overdue.length,
			net: receivable - payable,
			totalCount: this.allDebts.length,
		};
	}

	/** Shared filter (search + age + overdue) applied to both tabs. */
	private get baseFiltered(): Debt[] {
		if (this.allDebts === "loading") {
			return [];
		}
		const ageFn = AGE_PREDICATES[this.ageBucket];
		return this.allDebts.filter((d) => {
			if (this.onlyOverdue && d.overdueDays <= 0) {
				return false;
			}
			if (!ageFn(d)) {
				return false;
			}
			if (this.searchTerm.trim()) {
				return (
					matchesSearch(d.partnerName, this.searchTerm) ||
					matchesSearch(d.partnerCompany, this.searchTerm) ||
					String(d.number).includes(this.searchTerm.trim())
				);
			}
			return true;
		});
	}

	/** By-partner groups, sorted by absolute debt (largest first). */
	get partnerGroups(): DebtPartnerGroup[] {
		const map = new Map<number, Debt[]>();
		for (const d of this.baseFiltered) {
			const list = map.get(d.partnerId) ?? [];
			list.push(d);
			map.set(d.partnerId, list);
		}
		return [...map.values()]
			.map((items) => {
				const first = items[0];
				const sum = items.reduce(
					(s, d) => s + d.remaining * (d.direction === "Receivable" ? 1 : -1),
					0,
				);
				const oldest = items.reduce(
					(o, d) => (Date.parse(d.date) < Date.parse(o.date) ? d : o),
					first,
				);
				return {
					id: first.partnerId,
					partnerId: first.partnerId,
					partnerName: first.partnerName,
					partnerCompany: first.partnerCompany,
					direction: first.direction,
					transactionType: first.transactionType,
					sum,
					count: items.length,
					oldestDate: oldest.date,
					overdueCount: items.filter((d) => d.overdueDays > 0).length,
				};
			})
			.sort((a, b) => Math.abs(b.sum) - Math.abs(a.sum));
	}

	/** By-transaction rows: the direction filter over the shared filter — the
	 *  shared DataTable owns the ordering (columns sort; presets seed it). */
	get transactionRows(): Debt[] {
		return this.baseFiltered.filter((d) =>
			this.directionFilter === "all" ? true : d.direction === this.directionFilter,
		);
	}

	setTab(tab: DebtTab): void {
		this.tab = tab;
	}
	setSearch(term: string): void {
		this.searchTerm = term;
	}
	setAgeBucket(bucket: DebtAgeBucket): void {
		this.ageBucket = bucket;
	}
	setDirectionFilter(dir: DebtDirectionFilter): void {
		this.directionFilter = dir;
	}
	setOnlyOverdue(value: boolean): void {
		this.onlyOverdue = value;
	}

	clearFilters(): void {
		this.searchTerm = "";
		this.ageBucket = "all";
		this.onlyOverdue = false;
		this.directionFilter = "all";
	}

	applyCard(card: "receivable" | "payable" | "overdue"): void {
		this.tab = "transactions";
		this.txPresetNonce += 1;
		if (card === "receivable") {
			this.directionFilter = "Receivable";
			this.onlyOverdue = false;
			this.txPresetSort = "remaining";
		} else if (card === "payable") {
			this.directionFilter = "Payable";
			this.onlyOverdue = false;
			this.txPresetSort = "remaining";
		} else {
			this.directionFilter = "all";
			this.onlyOverdue = true;
			this.txPresetSort = "age";
		}
	}
}

export default DebtStore;
