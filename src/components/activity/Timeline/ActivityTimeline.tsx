import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isReady } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { ActivityFeed } from "stores/ActivityFeed";
import { designTokens } from "theme";
import { dayHeading, groupByDay } from "utils/activity/activityDays";

import { Box, CircularProgress, Typography } from "@mui/material";

import ActivityRow from "./ActivityRow";

interface ActivityTimelineProps {
	feed: ActivityFeed;
	/** What failed, for the error state («Не удалось загрузить журнал действий»). */
	errorTitle: string;
	/** The `TableEmptyState` for an empty result. */
	empty: React.ReactNode;
}

/**
 * The operations of a feed grouped by local day, newest first, with
 * «Показать ещё» for the next server page. Loading, failure and empty render
 * through the shared states; the caller supplies the surrounding card.
 */
export const ActivityTimeline: React.FC<ActivityTimelineProps> = observer(
	({ feed, errorTitle, empty }) => {
		const { t } = useTranslation();
		const items = feed.items;
		const days = useMemo(() => (isReady(items) ? groupByDay(items) : []), [items]);

		if (!isReady(items)) {
			return (
				<LoadStateView
					state={items}
					size="section"
					onRetry={() => void feed.reload()}
					errorTitle={errorTitle}
				/>
			);
		}
		if (items.length === 0) {
			return <>{empty}</>;
		}

		return (
			<Box>
				{days.map((day, index) => (
					<Box key={day.key} component="section">
						<Typography
							component="h3"
							sx={{
								fontSize: 12,
								fontWeight: 600,
								color: "text.secondary",
								p: "10px 18px",
								bgcolor: designTokens.gray25,
								borderTop: index === 0 ? 0 : 1,
								borderColor: "divider",
							}}
						>
							{dayHeading(t, day.date)}
						</Typography>
						{day.items.map((item) => (
							<ActivityRow key={item.operationId} item={item} feed={feed} />
						))}
					</Box>
				))}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: "12px",
						p: "12px 18px",
						borderTop: 1,
						borderColor: "divider",
					}}
				>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						{t("activity.list.shown", { shown: items.length, total: feed.total })}
					</Typography>
					{feed.hasMore && (
						<GhostButton
							onClick={() => void feed.loadMore()}
							icon={feed.loadingMore ? <CircularProgress size={16} /> : undefined}
						>
							{t("activity.list.more")}
						</GhostButton>
					)}
				</Box>
			</Box>
		);
	},
);

export default ActivityTimeline;
