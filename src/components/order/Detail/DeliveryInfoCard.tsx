import React from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { isOrderOverdue, shortDeliveryTime } from "utils/orderUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

const Row: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({
	icon,
	label,
	children,
}) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "flex-start",
			gap: "12px",
			p: "13px 18px",
			borderBottom: "1px solid",
			borderColor: "divider",
			"&:last-of-type": { borderBottom: "none" },
		}}
	>
		<Box
			sx={{
				width: 30,
				height: 30,
				borderRadius: "8px",
				display: "grid",
				placeItems: "center",
				flex: "0 0 auto",
				bgcolor: "grey.50",
				border: "1px solid",
				borderColor: "divider",
				color: "text.secondary",
			}}
		>
			{icon}
		</Box>
		<Box sx={{ minWidth: 0 }}>
			<Typography sx={{ fontSize: 12, color: "text.secondary" }}>{label}</Typography>
			<Typography component="div" sx={{ fontSize: 13.5, fontWeight: 500, mt: "2px" }}>
				{children}
			</Typography>
		</Box>
	</Box>
);

const Dash: React.FC<{ label: string }> = ({ label }) => (
	<Box component="span" sx={{ color: "text.disabled" }}>
		{label}
	</Box>
);

export const DeliveryInfoCard: React.FC<{ order: Order }> = ({ order }) => {
	const { t } = useTranslation();

	return (
		<DetailCard
			title={t("order.detail.delivery")}
			icon={<LocalShippingOutlinedIcon sx={{ fontSize: 17, color: "text.secondary" }} />}
		>
			<Row
				icon={<PlaceOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />}
				label={t("order.detail.address")}
			>
				{order.deliveryAddress ? (
					order.deliveryAddress
				) : (
					<Dash label={t("order.detail.noAddress")} />
				)}
			</Row>
			<Row
				icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />}
				label={t("order.detail.deliveryDate")}
			>
				{order.deliveryDate ? (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
						<Box component="span" sx={numericSx}>
							{formatDate(order.deliveryDate)}
						</Box>
						<Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
							{order.deliveryTime
								? t("order.detail.deliveryAtTime", { time: shortDeliveryTime(order.deliveryTime) })
								: t("order.detail.deliveryNoTime")}
						</Box>
						{isOrderOverdue(order) && (
							<Box
								component="span"
								sx={{
									display: "inline-flex",
									alignItems: "center",
									gap: "4px",
									px: "7px",
									py: "1px",
									borderRadius: "999px",
									fontSize: 11,
									fontWeight: 700,
									color: "error.main",
									bgcolor: designTokens.errorBg,
									border: "1px solid",
									borderColor: designTokens.errorBorder,
								}}
							>
								<ErrorOutlineIcon sx={{ fontSize: 12 }} />
								{t("order.detail.overdue")}
							</Box>
						)}
					</Box>
				) : (
					<Dash label={t("order.detail.noDeliveryDate")} />
				)}
			</Row>
			<Row icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 16 }} />} label={t("order.detail.note")}>
				{order.notes ? order.notes : <Dash label={t("order.detail.noNote")} />}
			</Row>
			{/* Surface the write-off warehouse only once it actually applies (delivered /
			    returned). A pre-delivery order may carry an *intended* warehouse, but stock
			    isn't touched yet, so it must not read as «Склад списания». */}
			{order.warehouseName && (order.status === "Delivered" || order.status === "Returned") && (
				<Row
					icon={<WarehouseOutlinedIcon sx={{ fontSize: 16 }} />}
					label={t("order.detail.warehouse")}
				>
					{order.warehouseName}
				</Row>
			)}
		</DetailCard>
	);
};

export default DeliveryInfoCard;
