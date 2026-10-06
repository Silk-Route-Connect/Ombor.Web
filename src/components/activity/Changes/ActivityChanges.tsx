import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { isLoadError, isReady } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { ActivityItem } from "models/activity";
import { ActivityFeed } from "stores/ActivityFeed";

import { Box, Stack, Typography } from "@mui/material";

import ActivityChangeSection from "./ActivityChangeSection";

/** Records shown at first, and added by each «Показать ещё» — an operation can change thousands (seeding). */
const STEP = 10;

interface ActivityChangesProps {
	id: string;
	item: ActivityItem;
	feed: ActivityFeed;
}

/**
 * The opened operation: one «Поле · Было · Стало» table per record it changed,
 * the primary record first. The list item carries at most 50 changes; going
 * past them fetches the whole operation.
 */
export const ActivityChanges: React.FC<ActivityChangesProps> = observer(({ id, item, feed }) => {
	const { t } = useTranslation();
	const [shown, setShown] = useState(STEP);

	const full = feed.fullOperation(item.operationId);
	const loaded = full !== undefined && isReady(full) ? full : null;
	const failed = isLoadError(full) ? full : null;
	const changes = loaded ? loaded.changes : item.changes;
	// The whole operation is served up to 2 000 changes; what lies beyond cannot be opened.
	const available = loaded ? loaded.changes.length : item.changeCount;
	const visible = changes.slice(0, shown);
	const remaining = available - visible.length;

	const showMore = () => {
		const next = shown + STEP;
		if (next > changes.length && item.changeCount > item.changes.length) {
			void feed.loadFullOperation(item.operationId);
		}
		setShown(next);
	};

	return (
		<Box id={id} sx={{ p: "4px 18px 18px", bgcolor: "background.default" }}>
			<Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, mb: "10px" }}>
				{t("activity.changes.title", {
					records: t("activity.changes.records", { count: item.changeCount }),
				})}
			</Typography>
			<Stack sx={{ gap: "12px" }}>
				{visible.map((change, index) => (
					<ActivityChangeSection
						key={`${change.entityKind}-${change.entityId}-${index}`}
						change={change}
					/>
				))}
			</Stack>
			{full === "loading" && <LoadStateView state="loading" size="section" />}
			{failed && (
				<LoadStateView
					state={failed}
					size="section"
					onRetry={() => void feed.loadFullOperation(item.operationId)}
					errorTitle={t("activity.error.loadOperation")}
				/>
			)}
			{remaining > 0 && full !== "loading" && !failed && (
				<GhostButton onClick={showMore} sx={{ mt: "12px" }}>
					{t("activity.changes.showMore", { count: remaining })}
				</GhostButton>
			)}
		</Box>
	);
});

export default ActivityChanges;
