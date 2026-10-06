import React from "react";
import { useTranslation } from "react-i18next";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import {
	ACTIVITY_ACTIONS,
	ACTIVITY_RECORD_KINDS,
	ActivityAction,
	ActivityRecordKind,
} from "models/activity";
import { IActivityLogStore } from "stores/ActivityLogStore";
import { byLabel } from "utils/sortUtils";
import { tenantUserLabel } from "utils/tenantUser";

import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Box } from "@mui/material";

const ALL = "all";

/**
 * The Activity Log filter row (pattern 11): who · what · action, and the shared
 * period filter last. Every change reloads the feed from the server.
 */
export const ActivityFilters: React.FC<{ store: IActivityLogStore }> = observer(({ store }) => {
	const { t } = useTranslation();

	const users = byLabel(readyOr(store.users, []), tenantUserLabel).map((user) => ({
		value: String(user.id),
		label: user.active
			? tenantUserLabel(user)
			: t("activity.filter.deactivated", { name: tenantUserLabel(user) }),
	}));
	const kinds = ACTIVITY_RECORD_KINDS.map((kind) => ({
		value: kind,
		label: t(`activity.kind.${kind}`),
	}));
	const actions = ACTIVITY_ACTIONS.map((action) => ({
		value: action,
		label: t(`activity.action.${action}`),
	}));

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
			<EntityFilterSelect
				label={t("activity.filter.who")}
				icon={<PersonOutlineIcon />}
				value={store.userFilter === null ? ALL : String(store.userFilter)}
				allValue={ALL}
				allLabel={t("activity.filter.allWho")}
				options={users}
				onChange={(value) => store.setUserFilter(value === ALL ? null : Number(value))}
			/>
			<EntityFilterSelect
				label={t("activity.filter.what")}
				icon={<CategoryOutlinedIcon />}
				value={store.kindFilter ?? ALL}
				allValue={ALL}
				allLabel={t("activity.filter.allWhat")}
				options={kinds}
				onChange={(value) =>
					store.setKindFilter(value === ALL ? null : (value as ActivityRecordKind))
				}
			/>
			<EntityFilterSelect
				label={t("activity.filter.action")}
				icon={<EditNoteOutlinedIcon />}
				value={store.actionFilter ?? ALL}
				allValue={ALL}
				allLabel={t("activity.filter.allActions")}
				options={actions}
				onChange={(value) =>
					store.setActionFilter(value === ALL ? null : (value as ActivityAction))
				}
			/>
			<Box sx={{ flexGrow: 1 }} />
			<DateRangeFilter value={store.dateRange} onChange={store.setDateRange} />
		</Box>
	);
});

export default ActivityFilters;
