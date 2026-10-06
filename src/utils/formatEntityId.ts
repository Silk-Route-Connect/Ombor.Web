/**
 * Canonical display for an internal entity id: 123 → «№123».
 *
 * Used wherever a transaction / payment / order id is surfaced to the user. The
 * raw number is never shown bare and the «№» prefix is never assembled inline —
 * route every id display through here so the format changes in one place.
 * Accepts strings too: some entities carry a served display number (e.g. the
 * order's `orderNumber`), which gets the same «№» presentation.
 *
 * Display-only: this formats the internal database id, NOT a persisted business
 * number. Real sequence numbering (per-document «№») is a v2 concern — when a
 * served display number exists it is shown as-is; this is the fallback/default
 * presentation of the id itself.
 */
export const formatEntityId = (id: number | string): string => `№${id}`;

/** True when a served document number is present (legacy rows may lack one). */
export const hasEntityNumber = (
	value: string | number | null | undefined,
): value is string | number => value != null && value !== "";

/**
 * A served document number that may be missing: «№42», or the caller's
 * «Без номера» label. Never substitute the database id — it can collide with a
 * real number once the sequence reaches it (live-ui-17).
 */
export const formatOptionalNumber = (
	value: string | number | null | undefined,
	missingLabel: string,
): string => (hasEntityNumber(value) ? formatEntityId(value) : missingLabel);

/** Numeric sort key for a served number string («10» after «9»); missing sorts first. */
export const entityNumberSortValue = (value: string | number | null | undefined): number => {
	if (!hasEntityNumber(value)) {
		return Number.NEGATIVE_INFINITY;
	}
	const n = Number(value);
	return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
};
