import React, { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import IconTile from "components/shared/IconTile/IconTile";
import UzsUnit from "components/shared/Money/UzsUnit";
import { ActivityItem } from "models/activity";
import { ActivityFeed } from "stores/ActivityFeed";
import { numericSx } from "theme";
import { activityAmount } from "utils/activity/activityAmount";
import { buildActivitySentence } from "utils/activity/activitySentence";
import { formatTime } from "utils/dateUtils";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, IconButton } from "@mui/material";

import ActivityChanges from "../Changes/ActivityChanges";
import ActivityRefLink from "./ActivityRefLink";
import { activityTile } from "./activityTile";

interface ActivityRowProps {
	item: ActivityItem;
	feed: ActivityFeed;
}

/**
 * One operation: time · the record's tile · who · what, in one sentence with
 * the record as a link, and its money figure. The chevron (or a click on the
 * row) opens what changed.
 */
export const ActivityRow: React.FC<ActivityRowProps> = ({ item, feed }) => {
	const { t } = useTranslation();
	const panelId = useId();
	const [open, setOpen] = useState(false);
	const sentence = useMemo(() => buildActivitySentence(t, item), [t, item]);
	const amount = useMemo(() => activityAmount(item), [item]);
	const tile = useMemo(() => activityTile(item), [item]);
	const TileIcon = tile.icon;
	const toggle = () => setOpen((value) => !value);

	return (
		<Box sx={{ borderTop: 1, borderColor: "divider" }}>
			<Box
				onClick={toggle}
				sx={{
					display: "grid",
					// On a phone the time, the sentence and the amount stack, so the sentence keeps the width.
					gridTemplateColumns: {
						xs: "28px minmax(0, 1fr) 32px",
						sm: "44px 28px minmax(0, 1fr) auto 32px",
					},
					gridTemplateAreas: {
						xs: '"tile time chev" "tile body chev" "tile amount chev"',
						sm: '"time tile body amount chev"',
					},
					alignItems: "center",
					columnGap: "12px",
					rowGap: { xs: "2px", sm: 0 },
					p: "10px 12px 10px 18px",
					cursor: "pointer",
					bgcolor: open ? "background.default" : undefined,
					"&:hover": { bgcolor: "action.hover" },
				}}
			>
				<Box
					component="span"
					sx={{ gridArea: "time", ...numericSx, fontSize: 13, color: "text.secondary" }}
				>
					{formatTime(item.at)}
				</Box>
				<Box sx={{ gridArea: "tile", alignSelf: { xs: "start", sm: "center" } }}>
					<IconTile icon={<TileIcon />} token={tile.token} size={28} />
				</Box>
				<Box
					sx={{
						gridArea: "body",
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
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							fontWeight: 600,
							color: item.actor ? "text.primary" : "text.secondary",
							whiteSpace: "nowrap",
						}}
					>
						{item.actor ? (
							<EntityAvatar name={item.actor.name} size={22} />
						) : (
							<SettingsOutlinedIcon aria-hidden sx={{ fontSize: 18, color: "text.disabled" }} />
						)}
						{item.actor?.name ?? t("activity.system")}
					</Box>
					<Box component="span" sx={{ minWidth: 0, color: "text.secondary" }}>
						{sentence.before}
						<ActivityRefLink value={sentence.ref} />
						{sentence.after}
					</Box>
				</Box>
				<Box
					component="span"
					sx={{
						gridArea: "amount",
						...numericSx,
						fontWeight: 600,
						whiteSpace: "nowrap",
						color: amount?.color,
					}}
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
					sx={{ gridArea: "chev" }}
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
