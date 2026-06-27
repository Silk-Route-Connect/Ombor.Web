/**
 * Canonical display for an internal numeric entity id: 123 → «№123».
 *
 * Used wherever a transaction / payment / order id is surfaced to the user. The
 * raw number is never shown bare and the «№» prefix is never assembled inline —
 * route every id display through here so the format changes in one place.
 *
 * Display-only: this formats the internal database id, NOT a persisted business
 * number. Real sequence numbering (per-document «№») is a v2 concern — when a
 * served display number exists it is shown as-is; this is the fallback/default
 * presentation of the id itself.
 */
export const formatEntityId = (id: number): string => `№${id}`;
