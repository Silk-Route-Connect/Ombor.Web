import React, { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MetaDot from "components/shared/Detail/MetaDot";
import UzsUnit from "components/shared/Money/UzsUnit";
import { ActivityItem } from "models/activity";
import { ActivityFeed } from "stores/ActivityFeed";
import { numericSx } from "theme";
import { activityAmount } from "utils/activity/activityAmount";
import { buildActivitySentence } from "utils/activity/activitySentence";
import { formatTime } from "utils/dateUtils";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, IconButton } from "@mui/material";

import ActivityChanges from "../Changes/ActivityChanges";
import ActivityRefLink from "./ActivityRefLink";

interface ActivityRowProps {
	item: ActivityItem;
	feed: ActivityFeed;
}

/**
 * One operation: time · who · what, in one sentence with the record as a link,
 * and its money figure. The chevron (or a click on the row) opens what changed.
 */
export const ActivityRow: React.FC<ActivityRowProps> = ({ item, feed }) => {
	const { t } = useTranslation();
	const panelId = useId();
	const [open, setOpen] = useState(false);
	const sentence = useMemo(() => buildActivitySentence(t, item), [t, item]);
	const amount = useMemo(() => activityAmount(item), [item]);
	const toggle = () => setOpen((value) => !value);

	return (
		<Box sx={{ borderTop: 1, borderColor: "divider" }}>
			<Box
				onClick={toggle}
				sx={{
					display: "grid",
					gridTemplateColumns: "44px minmax(0, 1fr) auto 32px",
					alignItems: "center",
					columnGap: "12px",
					p: "10px 12px 10px 18px",
					cursor: "pointer",
					bgcolor: open ? "background.default" : undefined,
					"&:hover": { bgcolor: "action.hover" },
				}}
			>
				<Box component="span" sx={{ ...numericSx, fontSize: 13, color: "text.secondary" }}>
					{formatTime(item.at)}
				</Box>
				<Box
					sx={{
						display: "flex",
						flexWrap: "wrap",
						alignItems: "center",
						columnGap: "8px",
						rowGap: "2px",
						fontSize: 14,
						minWidth: 0,
					}}
				>
					<Box
						component="span"
						sx={{
							fontWeight: 600,
							color: item.actor ? "text.primary" : "text.secondary",
							whiteSpace: "nowrap",
						}}
					>
						{item.actor?.name ?? t("activity.system")}
					</Box>
					<MetaDot />
					<Box component="span" sx={{ minWidth: 0 }}>
						{sentence.before}
						<ActivityRefLink value={sentence.ref} />
						{sentence.after}
					</Box>
				</Box>
				<Box
					component="span"
					sx={{ ...numericSx, fontWeight: 600, whiteSpace: "nowrap", color: amount?.color }}
				>
					{amount && (
						<>
							{amount.text}
							<UzsUnit />
						</>
					)}
				</Box>
				<IconButton
					size="small"
					aria-expanded={open}
					aria-controls={open ? panelId : undefined}
					aria-label={t(open ? "common.collapse" : "common.expand")}
					onClick={(e) => {
						e.stopPropagation();
						toggle();
					}}
				>
					<KeyboardArrowDownIcon
						sx={{ transform: open ? "rotate(180deg)" : undefined, transition: "transform 0.15s" }}
					/>
				</IconButton>
			</Box>
			{open && <ActivityChanges id={panelId} item={item} feed={feed} />}
		</Box>
	);
};

export default ActivityRow;
