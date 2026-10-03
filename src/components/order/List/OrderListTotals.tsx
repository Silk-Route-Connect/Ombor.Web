import React from "react";
import { useTranslation } from "react-i18next";
import TableTotals from "components/shared/Table/TableTotals";
import { Order } from "models/order";
import { formatQuantity } from "utils/formatCurrency";
import { sumBy } from "utils/listTotals";

interface OrderListTotalsProps {
	rows: Order[];
}

/** Orders footer: the count and the sum of the filtered orders. */
const OrderListTotals: React.FC<OrderListTotalsProps> = ({ rows }) => {
	const { t } = useTranslation();

	return (
		<TableTotals
			count={t("order.totals.count", {
				count: rows.length,
				formatted: formatQuantity(rows.length),
			})}
			items={[{ label: t("common.totals.amount"), value: sumBy(rows, (o) => o.total) }]}
		/>
	);
};

export default OrderListTotals;
