import React from "react";
import { Order } from "models/order";
import { numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { deliveryDateState } from "utils/orderUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box } from "@mui/material";

/**
 * Delivery date/time cell (bundle `.o-deliver`): overdue = red + alert icon,
 * done (delivered/returned) = muted, upcoming = ink + calendar icon. A dash when
 * no delivery date is set.
 */
export const OrderDeliveryCell: React.FC<{ order: Order }> = ({ order }) => {
	if (!order.deliveryDate) {
		return (
			<Box component="span" sx={{ ...numericSx, color: "text.disabled" }}>
				—
			</Box>
		);
	}

	const state = deliveryDateState(order);
	const overdue = state === "overdue";
	const tone =
		state === "overdue"
			? { text: "error.main", icon: "error.main", weight: 700 }
			: state === "done"
				? { text: "text.disabled", icon: "text.disabled", weight: 500 }
				: { text: "text.primary", icon: "primary.main", weight: 500 };

	return (
		<Box
			component="span"
			title={overdue ? "Доставка просрочена" : undefined}
			sx={{
				...numericSx,
				display: "inline-flex",
				alignItems: "center",
				gap: "6px",
				whiteSpace: "nowrap",
				color: tone.text,
				fontWeight: tone.weight,
			}}
		>
			{overdue ? (
				<ErrorOutlineIcon sx={{ fontSize: 13, color: tone.icon }} />
			) : (
				<CalendarTodayOutlinedIcon sx={{ fontSize: 13, color: tone.icon }} />
			)}
			{formatDate(order.deliveryDate)}
			{order.deliveryTime && (
				<Box component="span" sx={{ color: overdue ? "error.main" : "text.disabled" }}>
					· {order.deliveryTime}
				</Box>
			)}
		</Box>
	);
};

export default OrderDeliveryCell;
