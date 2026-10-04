import { format, isValid, parseISO, startOfYear } from "date-fns";
import { PartnerLedgerEntry } from "models/partner";

/** Calendar day key of the statement period and the ledger dates («yyyy-MM-dd», local time). */
const DAY_KEY = "yyyy-MM-dd";

/** The statement period: whole calendar days, both ends inclusive. */
export interface StatementPeriod {
	from: string;
	to: string;
}

export interface StatementRow {
	entry: PartnerLedgerEntry;
	/** In the business's favour — the partner owes more (sale, supply refund, money paid out to them). */
	debit: number;
	/** In the partner's favour — the partner owes less (supply, sale refund, money received). */
	credit: number;
	/** Served running balance after the entry (+ = the partner owes us). */
	balance: number;
}

/** A partner's reconciliation statement («Акт сверки») over a period, from the served ledger. */
export interface PartnerStatement {
	period: StatementPeriod;
	/** Balance before the period: the running balance of the last entry before `from`. */
	opening: number;
	rows: StatementRow[];
	debitTotal: number;
	creditTotal: number;
	/** Balance at the end: the running balance of the last entry in the period. */
	closing: number;
}

const dayKey = (date: Date | string): string => {
	const value = date instanceof Date ? date : new Date(date);
	return isValid(value) ? format(value, DAY_KEY) : "";
};

/** Start of the current year → today, the period a statement opens with. */
export const defaultStatementPeriod = (now: Date = new Date()): StatementPeriod => ({
	from: format(startOfYear(now), DAY_KEY),
	to: format(now, DAY_KEY),
});

const isDay = (value: string | null): value is string =>
	value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));

const earlier = (a: string, b: string): string => (a <= b ? a : b);

/**
 * The period from the page's `?from&to`: a missing or malformed end takes the
 * default, reversed ends are swapped so `from` is never after `to`, and both
 * are capped at today — the act states the balance «На <по>», never a future day.
 */
export function parseStatementPeriod(
	from: string | null,
	to: string | null,
	now: Date = new Date(),
): StatementPeriod {
	const fallback = defaultStatementPeriod(now);
	const today = fallback.to;
	const start = isDay(from) ? from : fallback.from;
	const end = isDay(to) ? to : fallback.to;
	const [first, last] = start <= end ? [start, end] : [end, start];
	return { from: earlier(first, today), to: earlier(last, today) };
}

/**
 * A zero opening balance is served as a «Начальный баланс» entry on the
 * partner's opening date, which can fall after their first documents — on paper
 * it would be an empty row in the middle of the period.
 */
const isEmptyOpening = (e: PartnerLedgerEntry): boolean => e.type === "opening" && e.delta === 0;

/**
 * Builds the statement from the served ledger (newest-first; its running
 * `balance` is server-computed and reconciles to the partner balance). Nothing
 * is recomputed here — opening, every row's balance and closing are served
 * values; only the period turnover is summed for the totals row.
 */
export function buildPartnerStatement(
	ledger: PartnerLedgerEntry[],
	period: StatementPeriod,
): PartnerStatement {
	const chronological = [...ledger].reverse();
	const before = chronological.filter((e) => dayKey(e.date) < period.from);
	const inPeriod = chronological.filter((e) => {
		const day = dayKey(e.date);
		return day >= period.from && day <= period.to && !isEmptyOpening(e);
	});

	const opening = before.length > 0 ? before[before.length - 1].balance : 0;
	const rows = inPeriod.map<StatementRow>((entry) => ({
		entry,
		debit: entry.delta > 0 ? entry.delta : 0,
		credit: entry.delta < 0 ? -entry.delta : 0,
		balance: entry.balance,
	}));

	return {
		period,
		opening,
		rows,
		debitTotal: rows.reduce((sum, r) => sum + r.debit, 0),
		creditTotal: rows.reduce((sum, r) => sum + r.credit, 0),
		closing: rows.length > 0 ? rows[rows.length - 1].balance : opening,
	};
}
