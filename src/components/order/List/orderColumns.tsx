import React from "react";
import OrderDeliveryCell from "components/order/OrderDeliveryCell";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

export function buildOrderColumns(
	t: TFunction,
	onOpenCustomer: (order: Order) => void,
): Column<Order>[] {
	return [
		{
			key: "date",
			headerName: t("order.col.date"),
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}>
					{formatDate(o.date)}
				</Box>
			),
		},
		{
			key: "number",
			headerName: t("order.col.number"),
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700, color: "primary.main" }}>
					#{o.orderNumber}
				</Box>
			),
		},
		{
			key: "customer",
			headerName: t("order.col.customer"),
			renderCell: (o) => (
				<Typography
					component="span"
					onClick={(e) => {
						e.stopPropagation();
						onOpenCustomer(o);
					}}
					sx={{
						fontWeight: 600,
						color: "primary.main",
						cursor: "pointer",
						"&:hover": { textDecoration: "underline" },
					}}
				>
					{o.customerName}
				</Typography>
			),
		},
		{
			key: "positions",
			headerName: t("order.col.positions"),
			align: "right",
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, color: designTokens.gray700 }}>
					{o.lines.length}
				</Box>
			),
		},
		{
			key: "total",
			headerName: t("order.col.total"),
			align: "right",
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{formatCurrency(o.total)}
				</Box>
			),
		},
		{
			key: "delivery",
			headerName: t("order.col.delivery"),
			renderCell: (o) => <OrderDeliveryCell order={o} />,
		},
		{
			key: "status",
			headerName: t("order.col.status"),
			renderCell: (o) => <OrderStatusChip status={o.status} />,
		},
		{
			key: "source",
			headerName: t("order.col.source"),
			renderCell: (o) => <OrderSourceChip source={o.source} />,
		},
	];
}
