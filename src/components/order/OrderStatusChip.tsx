import React from "react";
import { useTranslation } from "react-i18next";
import { OrderStatus } from "models/order";
import { designTokens } from "theme";
import { ORDER_STATUS_META, OrderStatusTone } from "utils/orderUtils";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import { alpha, Box, useTheme } from "@mui/material";

const ICON: Record<OrderStatus, React.ReactNode> = {
	Pending: <HourglassEmptyIcon sx={{ fontSize: 13 }} />,
	Processing: <Inventory2OutlinedIcon sx={{ fontSize: 13 }} />,
	Shipping: <LocalShippingOutlinedIcon sx={{ fontSize: 13 }} />,
	Delivered: <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />,
	Cancelled: <UndoOutlinedIcon sx={{ fontSize: 13 }} />,
	Rejected: <CloseIcon sx={{ fontSize: 13 }} />,
	Returned: <UndoOutlinedIcon sx={{ fontSize: 13 }} />,
};

interface OrderStatusChipProps {
	status: OrderStatus;
	/** Show the leading status icon (detail header uses it; the list omits it). */
	withIcon?: boolean;
}

/** Status pill per the bundle: soft tint, with strike (cancelled) and outline (rejected) variants. */
export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ status, withIcon }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	const meta = ORDER_STATUS_META[status];

	const toneColor = (tone: OrderStatusTone): string =>
		tone === "neutral" ? designTokens.gray600 : theme.palette[tone].main;
	const color = toneColor(meta.tone);

	const variantSx =
		meta.variant === "outline"
			? { color, bgcolor: "transparent", borderColor: alpha(color, 0.5) }
			: meta.variant === "strike"
				? {
						color: designTokens.gray600,
						bgcolor: designTokens.gray100,
						borderColor: designTokens.gray200,
						textDecoration: "line-through",
					}
				: {
						color,
						bgcolor: meta.tone === "neutral" ? designTokens.gray100 : alpha(color, 0.12),
						borderColor: meta.tone === "neutral" ? designTokens.gray200 : alpha(color, 0.24),
					};

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
				...variantSx,
			}}
		>
			{withIcon && ICON[status]}
			{t(`order.status.${status}`)}
		</Box>
	);
};

export default OrderStatusChip;
