import React from "react";
import OrderDeliveryCell from "components/order/OrderDeliveryCell";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import PartnerLink from "components/partner/Links/PartnerLink";
import CopyableNumberCell from "components/shared/Table/CopyableNumberCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

/** Keep an inner entity link from also triggering the row's open-detail click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

/**
 * Orders list columns, in the locked column-order convention (№/ID → date →
 * primary entity → … → status chips): №, Дата, Клиент, Позиций, Сумма,
 * Доставка, Статус, Источник. Every column sorts (sortValue accessors — no
 * plain `field`s here since every cell renders).
 */
export function buildOrderColumns(t: TFunction): Column<Order>[] {
	return [
		{
			key: "number",
			headerName: t("order.col.number"),
			sortValue: (o) => o.orderNumber,
			renderCell: (o) => <CopyableNumberCell value={o.orderNumber} />,
		},
		{
			key: "date",
			headerName: t("order.col.date"),
			sortValue: (o) => Date.parse(o.date),
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}>
					{formatDate(o.date)}
				</Box>
			),
		},
		{
			key: "customer",
			headerName: t("order.col.customer"),
			sortValue: (o) => o.customerName,
			renderCell: (o) => (
				<Box component="span" sx={{ fontWeight: 600 }} onClick={stop}>
					<PartnerLink id={o.customerId} name={o.customerName} />
				</Box>
			),
		},
		{
			key: "positions",
			headerName: t("order.col.positions"),
			align: "right",
			sortValue: (o) => o.lines.length,
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
			sortValue: (o) => o.total,
			renderCell: (o) => (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{formatCurrency(o.total)}
				</Box>
			),
		},
		{
			key: "delivery",
			headerName: t("order.col.delivery"),
			sortValue: (o) => o.deliveryDate ?? null,
			renderCell: (o) => <OrderDeliveryCell order={o} />,
		},
		{
			key: "status",
			headerName: t("order.col.status"),
			sortValue: (o) => t(`order.status.${o.status}`, { defaultValue: o.status }),
			renderCell: (o) => <OrderStatusChip status={o.status} />,
		},
		{
			key: "source",
			headerName: t("order.col.source"),
			sortValue: (o) => t(`order.source.${o.source}`, { defaultValue: o.source }),
			renderCell: (o) => <OrderSourceChip source={o.source} />,
		},
	];
}
