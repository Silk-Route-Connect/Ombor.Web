import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import OrderListHeader from "components/order/List/OrderListHeader";
import OrderListTotals from "components/order/List/OrderListTotals";
import OrdersTable from "components/order/List/OrdersTable";
import { buildOrderColumns } from "components/order/List/orderTableConfigs";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Order } from "models/order";
import { orderDetailPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatEntityId } from "utils/formatEntityId";
import { shortDeliveryTime } from "utils/orderUtils";

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
	const tableOrder = useTableOrder<Order>();

	useEffect(() => {
		orderStore.resetFilters();
		orderStore.getAll();
	}, [orderStore]);

	const columns = useMemo(() => buildOrderColumns(t), [t]);

	const handleExport = (): void => {
		const rows = readyOr(orderStore.listOrders, []);
		const csvColumns: CsvColumn<Order>[] = [
			{ header: t("order.col.number"), value: (o) => formatEntityId(o.orderNumber) },
			{ header: t("order.col.date"), value: (o) => formatDate(o.date) },
			{ header: t("order.col.customer"), value: (o) => o.customerName },
			{ header: t("order.col.status"), value: (o) => t(`order.status.${o.status}`) },
			{ header: t("order.col.source"), value: (o) => t(`order.source.${o.source}`) },
			{ header: t("order.col.positions"), value: (o) => o.lines.length },
			{
				header: t("order.col.delivery"),
				value: (o) =>
					o.deliveryDate
						? `${formatDate(o.deliveryDate)}${o.deliveryTime ? ` ${shortDeliveryTime(o.deliveryTime)}` : ""}`
						: "—",
			},
			{ header: t("order.col.total"), value: (o) => o.total },
		];
		exportToCsv(`orders_${csvDateStamp()}`, csvColumns, tableOrder.apply(rows));
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
				exportCount={readyOr(orderStore.listOrders, []).length}
			/>

			<OrdersTable
				exportOrder={tableOrder}
				onRetry={() => void orderStore.getAll()}
				errorTitle={t("order.error.getAll")}
				rows={orderStore.listOrders}
				columns={columns}
				isFiltering={orderStore.isFiltering}
				onOpen={(o) => navigate(orderDetailPath(o.id))}
				onCreate={() => navigate(PATHS.newOrder)}
				summary={isReady(orderStore.listOrders) && <OrderListTotals rows={orderStore.listOrders} />}
			/>
		</Box>
	);
});

export default OrderPage;
