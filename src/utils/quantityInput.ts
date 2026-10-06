export type WholeQuantityInput =
	| { kind: "empty" }
	| { kind: "whole"; value: number }
	/** A decimal separator was typed — quantities are whole base units. */
	| { kind: "fraction" }
	| { kind: "invalid" };

/**
 * Reads a typed quantity. Base-unit quantities are whole numbers (business-rules
 * rule 21), so a «,» / «.» is reported instead of stripped — stripping it turned
 * «1,5» into 15 and booked ten times the goods (ux-5).
 */
export function parseWholeQuantity(raw: string): WholeQuantityInput {
	const value = raw.replace(/\s/g, "");
	if (value === "") {
		return { kind: "empty" };
	}
	if (/[.,]/.test(value)) {
		return { kind: "fraction" };
	}
	if (!/^\d+$/.test(value)) {
		return { kind: "invalid" };
	}
	return { kind: "whole", value: Number(value) };
}

/** Text a quantity field may hold while typing: digits, spaces and a «,» / «.» to flag. */
export function isQuantityDraft(raw: string): boolean {
	return /^[\d\s.,]*$/.test(raw);
}
