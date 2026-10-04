import { TFunction } from "i18next";
import { SEARCH_GROUP_KEYS, SearchGroupKey, SearchHit, SearchResults } from "models/search";

import { activityRecordPath } from "./activity/activityLinks";
import { displayContact } from "./tenantUser";

/** One openable result row — the unit the keyboard moves over. */
export type SearchOption = {
	/** Stable across searches, so the DOM id (`aria-activedescendant`) follows the record. */
	key: string;
	group: SearchGroupKey;
	hit: SearchHit;
	path: string;
};

/** Where a hit opens: the same deep links the Activity Log uses for the record kind. */
export const searchHitPath = (hit: SearchHit): string | undefined =>
	activityRecordPath({ entityKind: hit.entityKind, entityId: hit.id });

/** Every openable hit in display order: the groups in menu order, each in the served order. */
export function searchOptions(results: SearchResults): SearchOption[] {
	return SEARCH_GROUP_KEYS.flatMap((group) =>
		results[group].items.flatMap((hit) => {
			const path = searchHitPath(hit);
			return path ? [{ key: `${hit.entityKind}-${hit.id}`, group, hit, path }] : [];
		}),
	);
}

export const searchTotal = (results: SearchResults): number =>
	SEARCH_GROUP_KEYS.reduce((sum, group) => sum + results[group].total, 0);

/** Matches the user cannot see in the row itself get a short «why it was found» note. */
const MATCH_NOTES: Partial<Record<SearchHit["matchedOn"], string>> = {
	Phone: "search.matched.phone",
	Barcode: "search.matched.barcode",
	PackagingBarcode: "search.matched.packagingBarcode",
};

/**
 * The muted second line of a result: a document's kind and partner, a product's
 * SKU, a partner's company or phone, an employee's position, a warehouse's
 * address — plus why it matched when that is not on screen (a phone, a barcode).
 */
export function searchHitSecondary(t: TFunction, group: SearchGroupKey, hit: SearchHit): string {
	const parts: string[] = [];
	if (group === "documents") {
		parts.push(t(`activity.kind.${hit.entityKind}`));
	}
	if (hit.detail) {
		parts.push(group === "partners" ? displayContact(hit.detail) : hit.detail);
	}
	const note = MATCH_NOTES[hit.matchedOn];
	if (note) {
		parts.push(t(note));
	}
	return parts.join(" · ");
}
