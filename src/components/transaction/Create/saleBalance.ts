import { partnerBalanceColor } from "utils/partnerUtils";

/**
 * Balance presentation for the New Sale/Supply partner card + picker: colour + a
 * natural-language label, never +/− signs. Colour is partner-POV via the shared
 * `partnerBalanceColor` — a partner who owes us reads red (they are the debtor),
 * money we owe them green (DR-27). The raw value's sign stays company-POV
 * (+ = partner owes us).
 */
export type BalancePresentation = {
	/** Full label key, e.g. «Нам должны». */
	labelKey: string;
	/** Short inline label key, e.g. «нам должны». */
	shortKey: string;
	/** MUI palette colour path for `sx.color`. */
	color: string;
};

export const balancePresentation = (balance: number): BalancePresentation => {
	const color = partnerBalanceColor(balance);
	if (balance > 0) {
		return {
			labelKey: "transaction.new.balance.receivable",
			shortKey: "transaction.new.balance.receivableShort",
			color,
		};
	}
	if (balance < 0) {
		return {
			labelKey: "transaction.new.balance.payable",
			shortKey: "transaction.new.balance.payableShort",
			color,
		};
	}
	return {
		labelKey: "transaction.new.balance.none",
		shortKey: "transaction.new.balance.noneShort",
		color,
	};
};

/** Initials for an avatar, e.g. «Антонина Давыдова» → «АД». */
export const initialsOf = (name: string): string =>
	name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("");
