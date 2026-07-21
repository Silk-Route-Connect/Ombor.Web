import React from "react";
import { useTranslation } from "react-i18next";
import { OrderStatus } from "models/order";
import { chipTokens } from "theme";
import { ORDER_STATUS_META, OrderStatusMeta } from "utils/orderUtils";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { Box } from "@mui/material";

const ICON: Record<OrderStatus, React.ReactNode> = {
	Pending: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
	Processing: <Inventory2OutlinedIcon sx={{ fontSize: 13 }} />,
	Shipping: <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />,
	Delivered: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
	Cancelled: <UndoOutlinedIcon sx={{ fontSize: 13 }} />,
	Rejected: <CloseIcon sx={{ fontSize: 13 }} />,
	Returned: <UndoOutlinedIcon sx={{ fontSize: 13 }} />,
};

// Neutral fallback for a status value the frontend doesn't know (the backend
// serves the enum as an open string) — an unknown state must never blank a list.
const FALLBACK_META: OrderStatusMeta = {
	chip: chipTokens.neutral,
	accent: chipTokens.neutral.color,
};

interface OrderStatusChipProps {
	status: OrderStatus;
	/** Show the leading status icon (detail header uses it; the list omits it). */
	withIcon?: boolean;
}

/** Lifecycle status pill — colours from `chipTokens` via {@link ORDER_STATUS_META}. */
export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ status, withIcon }) => {
	const { t } = useTranslation();
	const meta = (ORDER_STATUS_META as Record<string, OrderStatusMeta>)[status] ?? FALLBACK_META;

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "5px",
				px: "9px",
				py: "2px",
				borderRadius: "999px",
				fontSize: 11.5,
				fontWeight: 600,
				whiteSpace: "nowrap",
				border: "1px solid",
				color: meta.chip.color,
				bgcolor: meta.chip.bg,
				borderColor: meta.chip.border,
				textDecoration: meta.strike ? "line-through" : "none",
			}}
		>
			{withIcon && ICON[status]}
			{t(`order.status.${status}`, { defaultValue: status })}
		</Box>
	);
};

export default OrderStatusChip;
