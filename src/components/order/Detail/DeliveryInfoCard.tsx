import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import DetailCard, { detailCardIconSx } from "components/shared/Detail/DetailCard";
import { FactList, FactRow } from "components/shared/Detail/FactRow";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Order } from "models/order";
import { figuresSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { isOrderOverdue, shortDeliveryTime } from "utils/orderUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box } from "@mui/material";

/** «Доставка» — where and when the order goes, its note, and the write-off warehouse once it applies. */
export const DeliveryInfoCard: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();

	return (
		<DetailCard
			title={t("order.detail.delivery")}
			icon={<LocalShippingOutlinedIcon sx={detailCardIconSx} />}
		>
			<FactList grid>
				<FactRow stacked icon={<PlaceOutlinedIcon />} label={t("order.detail.address")}>
					{order.deliveryAddress}
				</FactRow>
				<FactRow
					stacked
					icon={<CalendarTodayOutlinedIcon />}
					label={t("order.detail.deliveryDate")}
				>
					{order.deliveryDate && (
						<Box
							sx={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
						>
							<Box component="span" sx={figuresSx}>
								{formatDate(order.deliveryDate)}
							</Box>
							<Box component="span" sx={{ ...figuresSx, color: "text.secondary" }}>
								{order.deliveryTime
									? t("order.detail.deliveryAtTime", {
											time: shortDeliveryTime(order.deliveryTime),
										})
									: t("order.detail.deliveryNoTime")}
							</Box>
							{isOrderOverdue(order) && (
								<StatusPill
									token="overdue"
									icon={ErrorOutlineIcon}
									label={t("order.detail.overdue")}
								/>
							)}
						</Box>
					)}
				</FactRow>
				{/* Surface the write-off warehouse only once it actually applies (delivered /
				    returned). A pre-delivery order may carry an *intended* warehouse, but stock
				    isn't touched yet, so it must not read as «Склад списания». */}
				{order.warehouseName && (order.status === "Delivered" || order.status === "Returned") && (
					<FactRow stacked icon={<WarehouseOutlinedIcon />} label={t("order.detail.warehouse")}>
						{order.warehouseId != null ? (
							<WarehouseLink id={order.warehouseId} name={order.warehouseName} />
						) : (
							order.warehouseName
						)}
					</FactRow>
				)}
				<FactRow stacked icon={<ReceiptLongOutlinedIcon />} label={t("order.detail.note")}>
					{order.notes}
				</FactRow>
			</FactList>
		</DetailCard>
	);
};

export default DeliveryInfoCard;
