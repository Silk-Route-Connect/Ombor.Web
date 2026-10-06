import React from "react";
import OrderDeliveryCell from "components/order/OrderDeliveryCell";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import PartnerLink from "components/partner/Links/PartnerLink";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { TFunction } from "i18next";
import { Order } from "models/order";
import { orderDetailPath } from "routing/paths";
import { entityNumberSortValue } from "utils/formatEntityId";

/**
 * Orders list columns in the canonical order (conventions.md → Tables):
 * № · Дата · Клиент · Статус · Источник · Позиций · Доставка · Сумма.
 */
export function buildOrderColumns(t: TFunction): Column<Order>[] {
	return [
		{
			key: "number",
			headerName: t("order.col.number"),
			sortValue: (o) => entityNumberSortValue(o.orderNumber),
			renderCell: (o) => <DocNumberCell number={o.orderNumber} to={orderDetailPath(o.id)} />,
		},
		{
			key: "date",
			headerName: t("order.col.date"),
			sortValue: (o) => Date.parse(o.date),
			renderCell: (o) => <DateCell value={o.date} />,
		},
		{
			key: "customer",
			headerName: t("order.col.customer"),
			sortValue: (o) => o.customerName,
			renderCell: (o) => <PartnerLink id={o.customerId} name={o.customerName} />,
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
		{
			key: "positions",
			headerName: t("order.col.positions"),
			align: "right",
			sortValue: (o) => o.lines.length,
			renderCell: (o) => <QuantityCell value={o.lines.length} />,
		},
		{
			key: "delivery",
			headerName: t("order.col.delivery"),
			sortValue: (o) => o.deliveryDate ?? null,
			renderCell: (o) => <OrderDeliveryCell order={o} />,
		},
		{
			key: "total",
			headerName: t("order.col.total"),
			align: "right",
			sortValue: (o) => o.total,
			renderCell: (o) => <MoneyCell value={o.total} main />,
		},
	];
}
