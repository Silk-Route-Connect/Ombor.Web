import React from "react";
import { useTranslation } from "react-i18next";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { TableOrder } from "components/shared/Table/tableOrder";
import { Loadable } from "helpers/Loading";
import { Order } from "models/order";

import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

interface OrdersTableProps {
	rows: Loadable<Order[]>;
	columns: Column<Order>[];
	isFiltering: boolean;
	onOpen: (order: Order) => void;
	onCreate: () => void;
	/** Re-runs the failed list load (the error state's «Повторить»). */
	onRetry: () => void;
	/** Error-state title, e.g. «Не удалось загрузить заказы». */
	errorTitle: string;
	/** Totals of the filtered rows in the footer band. */
	summary?: React.ReactNode;
	/** The page's `useTableOrder()` — its CSV export follows this table's sort. */
	exportOrder?: TableOrder<Order>;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
	onRetry,
	errorTitle,
	rows,
	columns,
	isFiltering,
	onOpen,
	onCreate,
	summary,
	exportOrder,
}) => {
	const { t } = useTranslation();

	return (
		<DataTable<Order>
			exportOrder={exportOrder}
			rows={rows}
			columns={columns}
			onRetry={onRetry}
			errorTitle={errorTitle}
			defaultSort={{ key: "date", order: "desc" }}
			onRowClick={onOpen}
			summary={summary}
			empty={
				<TableEmptyState
					icon={<SwapHorizOutlinedIcon />}
					title={isFiltering ? t("order.empty.searchTitle") : t("order.empty.title")}
					hint={isFiltering ? t("order.empty.searchBody") : t("order.empty.body")}
					action={isFiltering ? undefined : { label: t("order.create"), onClick: onCreate }}
				/>
			}
		/>
	);
};

export default OrdersTable;
