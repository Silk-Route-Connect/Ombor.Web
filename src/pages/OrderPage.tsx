import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { buildOrderColumns } from "components/order/List/orderColumns";
import OrderListHeader from "components/order/List/OrderListHeader";
import OrdersTable from "components/order/List/OrdersTable";
import { observer } from "mobx-react-lite";
import { Order } from "models/order";
import { orderDetailPath, partnerDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { orderTotal } from "utils/orderUtils";

import { Box } from "@mui/material";

/**
 * Orders (Заказы) — the immutable-feeling list of customer orders walking the
 * Pending → Delivered state machine. Routed full-page detail on row click; the
 * «Новый заказ» create flow is the separate full-page New Order screen.
 */
const OrderPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { orderStore } = useStore();

	useEffect(() => {
		orderStore.resetFilters();
		orderStore.getAll();
	}, [orderStore]);

	const columns = useMemo(
		() => buildOrderColumns(t, (o) => navigate(partnerDetailPath(o.customerId))),
		[t, navigate],
	);

	const handleExport = (): void => {
		const rows = orderStore.listOrders === "loading" ? [] : orderStore.listOrders;
		const csvColumns: CsvColumn<Order>[] = [
			{ header: t("order.col.date"), value: (o) => formatDate(o.date) },
			{ header: t("order.col.number"), value: (o) => `#${o.orderNumber}` },
			{ header: t("order.col.customer"), value: (o) => o.customerName },
			{ header: t("order.col.positions"), value: (o) => o.lines.length },
			{ header: t("order.col.total"), value: (o) => orderTotal(o.lines) },
			{
				header: t("order.col.delivery"),
				value: (o) =>
					o.deliveryDate
						? `${formatDate(o.deliveryDate)}${o.deliveryTime ? ` ${o.deliveryTime}` : ""}`
						: "—",
			},
			{ header: t("order.col.status"), value: (o) => t(`order.status.${o.status}`) },
			{
				header: t("order.col.source"),
				value: (o) => t(`order.source.${o.source}`),
			},
		];
		exportToCsv(`orders_${csvDateStamp()}`, csvColumns, rows);
	};

	return (
		<Box>
			<OrderListHeader
				searchValue={orderStore.searchTerm}
				statusFilter={orderStore.statusFilter}
				statusCounts={orderStore.statusCounts}
				dateRange={orderStore.dateRange}
				onSearch={orderStore.setSearch}
				onStatusChange={orderStore.setStatusFilter}
				onDateRangeChange={orderStore.setDateRange}
				onCreate={() => navigate(PATHS.newOrder)}
				onExport={handleExport}
			/>

			<OrdersTable
				rows={orderStore.listOrders}
				columns={columns}
				isFiltering={orderStore.isFiltering}
				onOpen={(o) => navigate(orderDetailPath(o.id))}
				onCreate={() => navigate(PATHS.newOrder)}
			/>
		</Box>
	);
});

export default OrderPage;
