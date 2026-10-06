import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { OrderStatus } from "models/order";
import { ORDER_STATUS_META } from "utils/orderUtils";

import { SvgIconComponent } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";

const ICON: Record<OrderStatus, SvgIconComponent> = {
	Pending: HourglassEmptyIcon,
	Processing: Inventory2OutlinedIcon,
	Shipping: LocalShippingOutlinedIcon,
	Delivered: CheckCircleOutlineIcon,
	Cancelled: UndoOutlinedIcon,
	Rejected: CloseIcon,
	Returned: UndoOutlinedIcon,
};

interface OrderStatusChipProps {
	status: OrderStatus;
	/** Show the leading status icon (detail header uses it; the list omits it). */
	withIcon?: boolean;
}

/** Lifecycle status pill — token per {@link ORDER_STATUS_META}. */
export const OrderStatusChip: React.FC<OrderStatusChipProps> = ({ status, withIcon }) => {
	const { t } = useTranslation();
	// The backend serves the enum as an open string — an unknown state renders
	// neutral instead of blanking the list.
	const meta = ORDER_STATUS_META[status];
	return (
		<StatusPill
			token={meta?.token ?? "neutral"}
			strike={meta?.strike}
			icon={withIcon ? ICON[status] : undefined}
			label={t(`order.status.${status}`, { defaultValue: status })}
		/>
	);
};

export default OrderStatusChip;
