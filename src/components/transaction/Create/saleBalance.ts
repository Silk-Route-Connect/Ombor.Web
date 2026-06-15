/**
 * Balance presentation for the New Sale partner card + picker: colour + a
 * natural-language label, never +/− signs (design-handoff locked pattern 4).
 * Sign convention: + = partner owes us (green) · − = we owe them (red).
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
	if (balance > 0) {
		return {
			labelKey: "transaction.new.balance.receivable",
			shortKey: "transaction.new.balance.receivableShort",
			color: "success.main",
		};
	}
	if (balance < 0) {
		return {
			labelKey: "transaction.new.balance.payable",
			shortKey: "transaction.new.balance.payableShort",
			color: "error.main",
		};
	}
	return {
		labelKey: "transaction.new.balance.none",
		shortKey: "transaction.new.balance.noneShort",
		color: "text.disabled",
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
