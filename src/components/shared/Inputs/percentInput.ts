import { formatExactPercent } from "utils/formatCurrency";

/**
 * Format/parse for percent inputs (line discount, bulk discount). A percent may
 * be fractional — rule 37 computes `gross × discount / 100` and the server
 * stores it at two decimals — so «1,5» and «1.5» both mean 1.5 %; the comma is
 * never stripped (that booked 15 %).
 */

/** 1.5 → «1,5» (the ru decimal comma); 0 renders blank so the placeholder shows. */
export const formatPercentInput = (value: number): string =>
	value > 0 ? formatExactPercent(value) : "";

/** Text a percent field may hold while typing: digits and one «,» / «.» with up to two decimals. */
export const isPercentDraft = (raw: string): boolean => /^\d*(?:[.,]\d{0,2})?$/.test(raw);

/** «1,5» / «1.5» → 1.5; blank or a lone separator → 0. */
export const parsePercentInput = (raw: string): number => {
	const value = Number(raw.replace(",", "."));
	return Number.isFinite(value) ? value : 0;
};
