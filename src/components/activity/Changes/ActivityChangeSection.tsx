import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import DetailTable from "components/shared/Detail/DetailTable";
import NotesCell from "components/shared/Table/cells/NotesCell";
import NoValue from "components/shared/Table/cells/NoValue";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TruncatedText from "components/shared/Table/TruncatedText";
import { TFunction } from "i18next";
import { ActivityAction, ActivityChange } from "models/activity";
import { ChipTokenKey, radius } from "theme";
import { ActivityFieldRow, activityFieldRows } from "utils/activity/activityFieldRows";
import { activityRecordPath } from "utils/activity/activityLinks";
import { activityRefText } from "utils/activity/activitySentence";

import { Box, Typography } from "@mui/material";

import ActivityRefLink from "../Timeline/ActivityRefLink";

const ACTION_TOKEN: Record<ActivityAction, ChipTokenKey> = {
	Created: "teal",
	Updated: "info",
	Archived: "neutral",
	Restored: "neutral",
	Deleted: "dangerOutline",
};

const VALUE_MAX_WIDTH = 320;

/**
 * A created record has no «Было» and a deleted one no «Стало» — their single
 * column reads «Значение».
 */
function buildColumns(t: TFunction, action: ActivityAction): Column<ActivityFieldRow>[] {
	const label: Column<ActivityFieldRow> = {
		key: "label",
		headerName: t("activity.changes.field"),
		width: "34%",
		sortable: false,
		renderCell: (row) => row.label,
	};
	const before: Column<ActivityFieldRow> = {
		key: "old",
		headerName: t(action === "Deleted" ? "activity.changes.value" : "activity.changes.old"),
		sortable: false,
		renderCell: (row) => <NotesCell text={row.old} maxWidth={VALUE_MAX_WIDTH} />,
	};
	const after: Column<ActivityFieldRow> = {
		key: "new",
		headerName: t(action === "Created" ? "activity.changes.value" : "activity.changes.new"),
		sortable: false,
		renderCell: (row) =>
			row.new === null ? <NoValue /> : <TruncatedText text={row.new} maxWidth={VALUE_MAX_WIDTH} />,
	};

	if (action === "Created") {
		return [label, after];
	}
	return action === "Deleted" ? [label, before] : [label, before, after];
}

/** One record an operation changed: what it is, what happened to it, and its fields before → after. */
export const ActivityChangeSection: React.FC<{ change: ActivityChange }> = ({ change }) => {
	const { t } = useTranslation();
	const rows = useMemo(() => activityFieldRows(t, change), [t, change]);
	const columns = useMemo(() => buildColumns(t, change.action), [t, change.action]);
	const ref = {
		text: activityRefText(t, change),
		to: change.action === "Deleted" ? undefined : activityRecordPath(change),
	};

	return (
		<Box
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.md}px`,
				overflow: "hidden",
				bgcolor: "background.paper",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "8px",
					p: "10px 16px",
					borderBottom: 1,
					borderColor: "divider",
					fontSize: 13,
				}}
			>
				<Box component="span" sx={{ color: "text.secondary" }}>
					{t(`activity.kind.${change.entityKind}`)}
				</Box>
				<ActivityRefLink value={ref} />
				<StatusPill
					token={ACTION_TOKEN[change.action]}
					label={t(`activity.action.${change.action}`)}
				/>
			</Box>
			{rows.length > 0 ? (
				<DetailTable rows={rows} columns={columns} />
			) : (
				<Typography variant="body2" sx={{ color: "text.secondary", p: "12px 16px" }}>
					{t("activity.changes.noFields")}
				</Typography>
			)}
		</Box>
	);
};

export default ActivityChangeSection;
