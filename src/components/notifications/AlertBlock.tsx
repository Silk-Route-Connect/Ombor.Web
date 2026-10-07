import React from "react";
import { useTranslation } from "react-i18next";
import DetailLink from "components/shared/Link/DetailLink";
import { NotificationAlert } from "models/notification";
import { chipTokens, radius } from "theme";
import { activityRecordPath } from "utils/activity/activityLinks";
import { alertItemDetails, alertItemTitle, alertSentence } from "utils/alertText";
import { formatQuantity } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Typography } from "@mui/material";

import { ALERT_ITEMS_SHOWN, ALERT_META } from "./alertMeta";

interface AlertBlockProps {
	alert: NotificationAlert;
	/** It grew since «Отметить как прочитанные». */
	unseen: boolean;
	/** The headline: open the list narrowed to this alert's records. */
	onOpenAlert: () => void;
	/** One record's page (a sale, an order, a product). */
	onOpenItem: (path: string) => void;
}

/**
 * One alert in the bell: the plain sentence as a button to the filtered list,
 * then its most pressing records, each a link to its own page.
 */
const AlertBlock: React.FC<AlertBlockProps> = ({ alert, unseen, onOpenAlert, onOpenItem }) => {
	const { t } = useTranslation();
	const { icon: Icon, token } = ALERT_META[alert.kind];
	const tint = chipTokens[token];
	const shown = alert.items.slice(0, ALERT_ITEMS_SHOWN);
	const more = alert.count - shown.length;

	return (
		<Box sx={{ px: 1, py: 0.75, "& + &": { borderTop: 1, borderColor: "divider" } }}>
			<ButtonBase
				onClick={onOpenAlert}
				sx={{
					display: "flex",
					alignItems: "center",
					gap: 1.5,
					width: "100%",
					px: 1,
					py: 0.75,
					borderRadius: `${radius.md}px`,
					textAlign: "left",
					fontFamily: "inherit",
					"&:hover": { bgcolor: "action.hover" },
				}}
			>
				<Box
					sx={{
						display: "grid",
						placeItems: "center",
						width: 32,
						height: 32,
						flex: "0 0 auto",
						borderRadius: `${radius.md}px`,
						bgcolor: tint.bg,
						color: tint.color,
					}}
				>
					<Icon sx={{ fontSize: 18 }} />
				</Box>
				<Typography sx={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600 }}>
					{alertSentence(t, alert)}
				</Typography>
				{unseen && (
					<Box
						component="span"
						role="img"
						aria-label={t("notifications.new")}
						sx={{
							width: 8,
							height: 8,
							flex: "0 0 auto",
							borderRadius: "50%",
							bgcolor: "primary.main",
						}}
					/>
				)}
				<ChevronRightIcon sx={{ fontSize: 18, color: "text.secondary" }} />
			</ButtonBase>

			<Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, pl: "58px", pr: 1 }}>
				{shown.map((item) => {
					const path = activityRecordPath({ entityKind: item.entityKind, entityId: item.id });
					const title = alertItemTitle(t, item);
					// Wraps between parts rather than truncating: the line ends with the point
					// of the alert («86 дней просрочки», «нет в наличии»).
					return (
						<Typography
							component="li"
							// A low-stock product appears once per warehouse.
							key={`${item.entityKind}-${item.id}-${item.warehouseId ?? ""}`}
							sx={{ fontSize: 13, color: "text.secondary", py: "2px" }}
						>
							{path ? (
								<DetailLink to={path} onOpen={() => onOpenItem(path)}>
									{title}
								</DetailLink>
							) : (
								title
							)}
							{alertItemDetails(t, alert.kind, item).map((part, i) => (
								<React.Fragment key={i}>
									{" · "}
									<Box component="span" sx={{ whiteSpace: "nowrap" }}>
										{part}
									</Box>
								</React.Fragment>
							))}
						</Typography>
					);
				})}
				{more > 0 && (
					<Typography component="li" sx={{ fontSize: 12, color: "text.disabled", py: "2px" }}>
						{t("notifications.more", { formatted: formatQuantity(more) })}
					</Typography>
				)}
			</Box>
		</Box>
	);
};

export default AlertBlock;
