import { KindPresentation } from "components/shared/Chip/movementKind";
import { recordTile } from "components/shared/IconTile/recordTile";
import { ActivityItem, ActivityRecordKind } from "models/activity";
import { currentValue, findField, findPrimaryChange } from "utils/activity/activitySentence";

/**
 * The leading tile of a timeline row, by the record the operation is about:
 * documents in their type hue (the shared movement-kind presentation), payments
 * green / red by direction like their amount, everything else neutral with the
 * module's own icon — so the log reads at a glance without a chip per row.
 */
export function activityTile(item: ActivityItem): KindPresentation {
	const kind = item.primary.entityKind as ActivityRecordKind;
	const tile = recordTile(kind);
	if (kind === "Payment") {
		const direction = currentValue(findField(findPrimaryChange(item), "direction"));
		if (direction === "Income") return { ...tile, token: "income" };
		if (direction === "Expense") return { ...tile, token: "expense" };
	}
	return tile;
}
