import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ActivityFilters from "components/activity/Filters/ActivityFilters";
import ActivityTimeline from "components/activity/Timeline/ActivityTimeline";
import PageHeader from "components/shared/PageHeader/PageHeader";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { radius } from "theme";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { Paper } from "@mui/material";

/**
 * «Журнал действий» (mvp-plan §17, rules 26–28): every operation — documents,
 * payments, stock and master-data edits — with who did it, filterable by
 * period, person, record kind and action, each opening its before → after.
 */
const ActivityLogPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { activityLogStore } = useStore();

	useEffect(() => {
		void activityLogStore.open();
		return () => activityLogStore.clear();
	}, [activityLogStore]);

	const filtering = activityLogStore.isFiltering;

	return (
		<>
			<PageHeader
				title={t("page.activityLog.title")}
				icon={HistoryOutlinedIcon}
				subtitle={t("activity.page.subtitle")}
			/>
			<ActivityFilters store={activityLogStore} />
			<Paper
				elevation={1}
				sx={{
					border: 1,
					borderColor: "divider",
					borderRadius: `${radius.lg}px`,
					overflow: "hidden",
				}}
			>
				<ActivityTimeline
					feed={activityLogStore.feed}
					errorTitle={t("activity.error.load")}
					empty={
						<TableEmptyState
							icon={<HistoryOutlinedIcon />}
							title={t(filtering ? "activity.empty.filteredTitle" : "activity.empty.title")}
							hint={t(filtering ? "activity.empty.filteredHint" : "activity.empty.hint")}
						/>
					}
				/>
			</Paper>
		</>
	);
});

export default ActivityLogPage;
