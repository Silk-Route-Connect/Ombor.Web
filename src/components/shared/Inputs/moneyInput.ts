import { formatCurrency } from "utils/formatCurrency";

/**
 * Shared format/parse logic for money inputs — the single source of truth behind
 * both `MoneyField` (TextField) and `MoneyInputBase` (bare InputBase), so the two
 * never drift. UZS-only: whole numbers, no decimals (F-024). All grouping routes
 * through `formatCurrency` — never hand-assemble separators.
 */

/** Strip every non-digit; tolerates the space group separators `formatCurrency` emits. */
export const moneyDigits = (raw: string): string => raw.replace(/\D/g, "");

/**
 * Raw UZS amount → the grouped string shown in the input («5 000 000»). Zero
 * renders blank so the field's placeholder shows instead of a literal «0».
 */
export const formatMoneyInput = (value: number): string => (value > 0 ? formatCurrency(value) : "");

/** Parse an input's raw text back to a whole UZS amount, clamped to `max` when given. */
export const parseMoneyInput = (raw: string, max?: number): number => {
	const digits = moneyDigits(raw);
	let next = digits === "" ? 0 : Number(digits);
	if (max != null && next > max) {
		next = max;
	}
	return next;
};
