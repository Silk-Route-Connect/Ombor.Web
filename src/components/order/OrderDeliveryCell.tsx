import React from "react";
import { useTranslation } from "react-i18next";
import { Order } from "models/order";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { isOrderOverdue, shortDeliveryTime } from "utils/orderUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box } from "@mui/material";

/**
 * Delivery date/time cell — exactly two states: **overdue** (red + alert icon,
 * still undelivered past the requested date) and **standard** (ink + calendar
 * icon) for everything else. A dash when no delivery date is set.
 */
export const OrderDeliveryCell: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();

	if (!order.deliveryDate) {
		return (
			<Box component="span" sx={{ ...numericSx, color: "text.disabled" }}>
				—
			</Box>
		);
	}

	const overdue = isOrderOverdue(order);

	return (
		<Box
			component="span"
			title={overdue ? t("order.list.overdueTooltip") : undefined}
			sx={{
				...numericSx,
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				whiteSpace: "nowrap",
				color: overdue ? "error.main" : "text.primary",
				fontWeight: overdue ? 700 : 500,
			}}
		>
			{overdue ? (
				<ErrorOutlineIcon sx={{ fontSize: 13, color: "error.main" }} />
			) : (
				<CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
			)}
			{formatDate(order.deliveryDate)}
			{order.deliveryTime && (
				<Box component="span" sx={{ color: overdue ? "error.main" : "text.secondary" }}>
					· {shortDeliveryTime(order.deliveryTime)}
				</Box>
			)}
		</Box>
	);
};

export default OrderDeliveryCell;
