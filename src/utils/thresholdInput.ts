import { Measurement } from "models/product";

/**
 * A warehouse row's «Заканчивается» threshold as typed (DR-41). The server keeps
 * it like a stock quantity — decimal(18,3): at most 15 digits before the
 * separator and 3 after. Weight units take a fraction («2,5 кг»); counted units
 * (шт, коробки) are whole, as their stock is (rule 21).
 */
const FRACTIONAL_UNITS: ReadonlySet<Measurement> = new Set(["Gram", "Kilogram", "Ton"]);

export const allowsFractionalThreshold = (measurement: Measurement): boolean =>
	FRACTIONAL_UNITS.has(measurement);

export type ThresholdInput =
	| { kind: "empty" }
	| { kind: "value"; value: number }
	/** A «,» / «.» typed for a counted unit: stays visible and is flagged, never stripped (R21). */
	| { kind: "notWhole" };

/** Text the field may hold while typing: digits, one «,» / «.», up to three decimals. */
export const isThresholdDraft = (raw: string): boolean =>
	/^\d{0,15}(?:[.,]\d{0,3})?$/.test(raw.replace(/\s/g, ""));

/** «2,5» / «2.5» → 2.5; blank or a lone separator → empty (not tracked). */
export function parseThresholdInput(raw: string, allowFraction: boolean): ThresholdInput {
	const value = raw.replace(/\s/g, "").replace(",", ".");
	if (value === "" || value === ".") {
		return { kind: "empty" };
	}
	if (!allowFraction && value.includes(".")) {
		return { kind: "notWhole" };
	}
	return { kind: "value", value: Number(value) };
}

/** 2.5 → «2,5» (the ru decimal comma); null → "" (not tracked). */
export const formatThresholdInput = (value: number | null | undefined): string =>
	value == null || !Number.isFinite(value) ? "" : String(value).replace(".", ",");
