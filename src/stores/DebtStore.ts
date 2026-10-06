import { isReady, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import { Debt, DebtDirection, DebtPartnerPosition, DebtSummary } from "../models/debt";
import DebtApi from "../services/api/DebtApi";
import { NotificationStore } from "./NotificationStore";

export type DebtTab = "partners" | "transactions";
export type DebtDirectionFilter = DebtDirection | "all";
export type DebtAgeBucket = "all" | "0-7" | "8-30" | "31+" | "31-60" | "60+";

/** Dashboard / Debts summary cards that pre-filter the debts tables. */
export type DebtCard = "receivable" | "payable" | "overdue" | "aged";
/** Initial-sort seed for the documents table (column headers own ad-hoc sorting). */
export type DebtTxPresetSort = "remaining" | "age";

/** A «По партнёрам» row: the served position, keyed for the table, with its past-due documents. */
export type DebtPartnerRow = DebtPartnerPosition & { id: number; overdueCount: number };

const AGE_PREDICATES: Record<DebtAgeBucket, (days: number) => boolean> = {
	all: () => true,
	"0-7": (d) => d <= 7,
	"8-30": (d) => d >= 8 && d <= 30,
	"31+": (d) => d >= 31,
	"31-60": (d) => d >= 31 && d <= 60,
	"60+": (d) => d > 60,
};

export interface IDebtStore {
	/** The unpaid documents («Неоплаченные документы»). */
	allDebts: Loadable<Debt[]>;
	/** Served debt totals and partner positions — every «Нам должны» / «Мы должны» figure. */
	summary: Loadable<DebtSummary>;
	partnerRows: DebtPartnerRow[];
	transactionRows: Debt[];

	tab: DebtTab;
	searchTerm: string;
	ageBucket: DebtAgeBucket;
	directionFilter: DebtDirectionFilter;
	/** Seeds the documents table's initial sort (set by the card presets). */
	txPresetSort: DebtTxPresetSort;
	/** Bumped on every card click so the table re-seeds even for the same preset. */
	txPresetNonce: number;
	onlyOverdue: boolean;

	/** The «Долги» page: the unpaid documents and the totals together. */
	getAll(): Promise<void>;
	/** The totals alone (Partners summary strip). */
	getSummary(): Promise<void>;
	setTab(tab: DebtTab): void;
	setSearch(term: string): void;
	setAgeBucket(bucket: DebtAgeBucket): void;
	setDirectionFilter(dir: DebtDirectionFilter): void;
	setOnlyOverdue(value: boolean): void;
	clearFilters(): void;
	/** A summary-card click opens the matching tab with a preset filter. */
	applyCard(card: DebtCard): void;
}

/**
 * «Долги»: who owes whom (the served net partner positions — never re-derived
 * from the document list, hard rule 8) and the unpaid documents behind them.
 * Search, direction, age and «только просроченные» filter both tabs.
 */
export class DebtStore implements IDebtStore {
	private readonly notificationStore: NotificationStore;
	private readonly summaryLoads = new LoadSequence();

	allDebts: Loadable<Debt[]> = "loading";
	summary: Loadable<DebtSummary> = "loading";
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
		const isCurrent = this.summaryLoads.begin();
		runInAction(() => {
			this.allDebts = "loading";
			this.summary = "loading";
		});

		const [debts, summary] = await Promise.all([
			tryRun(() => DebtApi.getAll()),
			tryRun(() => DebtApi.getSummary()),
		]);

		runInAction(() => {
			this.allDebts = toLoadable(debts);
			if (isCurrent()) {
				this.summary = toLoadable(summary);
			}
		});
	}

	async getSummary(): Promise<void> {
		const isCurrent = this.summaryLoads.begin();
		// A refresh (after a partner edit) keeps the figures on screen until it lands.
		if (!isReady(this.summary)) {
			runInAction(() => (this.summary = "loading"));
		}

		const result = await tryRun(() => DebtApi.getSummary());
		if (!isCurrent()) {
			return;
		}
		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "debt.error.summary");
		}
		runInAction(() => (this.summary = toLoadable(result)));
	}

	/** Partner id → its unpaid documents past their due date. */
	private get overdueCountByPartner(): Map<number, number> {
		const counts = new Map<number, number>();
		if (isReady(this.allDebts)) {
			for (const d of this.allDebts) {
				if (d.overdueDays > 0) {
					counts.set(d.partnerId, (counts.get(d.partnerId) ?? 0) + 1);
				}
			}
		}
		return counts;
	}

	/**
	 * Served positions under the filters. The age filter reads the age of what
	 * the partner owes us, so a partner we owe drops out of any age bucket.
	 */
	get partnerRows(): DebtPartnerRow[] {
		if (!isReady(this.summary)) {
			return [];
		}
		const overdue = this.overdueCountByPartner;
		const ageFn = AGE_PREDICATES[this.ageBucket];
		const term = this.searchTerm.trim();
		return this.summary.partners
			.map((p) => ({ ...p, id: p.partnerId, overdueCount: overdue.get(p.partnerId) ?? 0 }))
			.filter((p) => {
				if (this.directionFilter !== "all" && p.direction !== this.directionFilter) {
					return false;
				}
				if (this.onlyOverdue && p.overdueCount === 0) {
					return false;
				}
				if (this.ageBucket !== "all" && (p.oldestAgeDays == null || !ageFn(p.oldestAgeDays))) {
					return false;
				}
				return !term || matchesSearch(p.name, term) || matchesSearch(p.company, term);
			});
	}

	/** Unpaid documents under the filters — the shared DataTable owns the ordering. */
	get transactionRows(): Debt[] {
		if (!isReady(this.allDebts)) {
			return [];
		}
		const ageFn = AGE_PREDICATES[this.ageBucket];
		const term = this.searchTerm.trim();
		return this.allDebts.filter((d) => {
			if (this.directionFilter !== "all" && d.direction !== this.directionFilter) {
				return false;
			}
			if (this.onlyOverdue && d.overdueDays <= 0) {
				return false;
			}
			if (!ageFn(d.ageDays)) {
				return false;
			}
			return (
				!term ||
				matchesSearch(d.partnerName, term) ||
				matchesSearch(d.partnerCompany, term) ||
				(d.number ?? "").includes(term)
			);
		});
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

	/**
	 * «Нам должны» / «Мы должны» and the dashboard's «Долги старше 30 дней» are
	 * partner positions → «По партнёрам»; «Просрочено» is a document's due date →
	 * «Неоплаченные документы».
	 */
	applyCard(card: DebtCard): void {
		this.txPresetNonce += 1;
		this.ageBucket = "all";
		this.onlyOverdue = false;
		if (card === "overdue") {
			this.tab = "transactions";
			this.directionFilter = "all";
			this.onlyOverdue = true;
			this.txPresetSort = "age";
			return;
		}
		this.tab = "partners";
		this.directionFilter = card === "payable" ? "Payable" : "Receivable";
		if (card === "aged") {
			this.ageBucket = "31+";
		}
	}
}

export default DebtStore;
