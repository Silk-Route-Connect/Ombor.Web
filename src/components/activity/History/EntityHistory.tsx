import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { observer } from "mobx-react-lite";
import { ActivityRecordKind } from "models/activity";
import { useStore } from "stores/StoreContext";

import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";

import ActivityTimeline from "../Timeline/ActivityTimeline";

interface EntityHistoryProps {
	kind: ActivityRecordKind;
	id: number;
	/**
	 * Changes when the page saves the record (the fresh entity object), so an
	 * edit made while the history is open shows up in it.
	 */
	refreshKey?: unknown;
	/** `tab`: the «История» tab of a tabbed detail page; `card`: a card in a page without tabs. */
	variant?: "tab" | "card";
}

/**
 * A detail page's «История»: the Activity Log timeline narrowed to this record
 * and its lines — who created and changed it, and when.
 */
export const EntityHistory: React.FC<EntityHistoryProps> = observer(
	({ kind, id, refreshKey, variant = "tab" }) => {
		const { t } = useTranslation();
		const { entityHistoryStore } = useStore();

		useEffect(() => {
			void entityHistoryStore.open(kind, id);
		}, [entityHistoryStore, kind, id, refreshKey]);

		useEffect(() => () => entityHistoryStore.clear(), [entityHistoryStore]);

		const timeline = (
			<ActivityTimeline
				feed={entityHistoryStore.feed}
				errorTitle={t("activity.error.history")}
				empty={
					<TableEmptyState
						icon={<HistoryOutlinedIcon />}
						title={t("activity.history.emptyTitle")}
						hint={t("activity.history.emptyHint")}
					/>
				}
			/>
		);

		return variant === "card" ? (
			<DetailCard
				title={t("activity.history.cardTitle")}
				icon={<HistoryOutlinedIcon sx={detailCardIconSx} />}
			>
				{timeline}
			</DetailCard>
		) : (
			<DetailTableCard>{timeline}</DetailTableCard>
		);
	},
);

export default EntityHistory;
