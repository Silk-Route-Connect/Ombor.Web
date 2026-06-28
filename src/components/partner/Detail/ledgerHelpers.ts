import { useEffect, useState } from "react";
import { PartnerLedgerEntry } from "models/partner";
import { formatCurrency } from "utils/formatCurrency";

export type LedgerPeriod = "all" | "90" | "30";

/** Page-size options for the in-widget detail-tab pagers. */
export const DETAIL_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

/**
 * Page state for an in-widget detail table. Resets to the first page whenever
 * the filter/search signature (`resetKey`) changes so a narrowed result set
 * never lands the user on an out-of-range page.
 */
export function useDetailTablePage(resetKey: unknown) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(DETAIL_ROWS_PER_PAGE_OPTIONS[0]);

	useEffect(() => {
		setPage(0);
	}, [resetKey]);

	const changeRowsPerPage = (next: number) => {
		setRowsPerPage(next);
		setPage(0);
	};

	const paginate = <T>(rows: T[]): T[] =>
		rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return { page, rowsPerPage, setPage, changeRowsPerPage, paginate };
}

const MS_PER_DAY = 86_400_000;

/** Signed money for ledger amount/balance columns: "+1 250 000" / "−800 000" / "0". */
export function formatSigned(value: number): string {
	if (value === 0) {
		return "0";
	}
	return `${value > 0 ? "+" : "−"}${formatCurrency(Math.abs(value))}`;
}

/** Whether an event falls within the selected look-back window (relative to today). */
export function withinPeriod(isoDate: string, period: LedgerPeriod): boolean {
	if (period === "all") {
		return true;
	}
	const days = Number(period);
	const eventTime = Date.parse(isoDate);
	if (Number.isNaN(eventTime)) {
		return true;
	}
	const diffDays = (Date.now() - eventTime) / MS_PER_DAY;
	return diffDays <= days;
}

export const TRANSACTION_TYPES = new Set(["sale", "supply", "refund-sale", "refund-supply"]);
export const PAYMENT_TYPES = new Set(["payment", "deposit", "withdraw"]);

export const deriveTransactions = (ledger: PartnerLedgerEntry[]): PartnerLedgerEntry[] =>
	ledger.filter((e) => TRANSACTION_TYPES.has(e.type));

export const derivePayments = (ledger: PartnerLedgerEntry[]): PartnerLedgerEntry[] =>
	ledger.filter((e) => PAYMENT_TYPES.has(e.type));
