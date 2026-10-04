import { TFunction } from "i18next";
import { ActivityChange } from "models/activity";

import { activityFieldLabel, formatActivityValue, PASSWORD_FIELD } from "./activityFields";

/** One «Поле · Было · Стало» row; `null` values read «—». */
export interface ActivityFieldRow {
	id: string;
	label: string;
	old: string | null;
	new: string | null;
}

/**
 * The recorded fields of one record, labelled and formatted for the table. A
 * field empty on both sides (a blank note on a created record) is left out.
 */
export function activityFieldRows(t: TFunction, change: ActivityChange): ActivityFieldRow[] {
	const rows = change.fields.map(
		(f): ActivityFieldRow =>
			f.field === PASSWORD_FIELD
				? {
						id: f.field,
						label: activityFieldLabel(t, change.entityKind, f.field),
						old: null,
						new: t("activity.value.passwordChanged"),
					}
				: {
						id: f.field,
						label: activityFieldLabel(t, change.entityKind, f.field),
						old: formatActivityValue(t, change.entityKind, f.field, f.old),
						new: formatActivityValue(t, change.entityKind, f.field, f.new),
					},
	);
	return rows.filter((row) => row.old !== null || row.new !== null);
}
