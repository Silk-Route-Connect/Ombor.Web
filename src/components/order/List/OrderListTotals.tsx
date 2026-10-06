import React from "react";
import { useTranslation } from "react-i18next";
import TableTotals from "components/shared/Table/TableTotals";
import { Order } from "models/order";
import { formatQuantity } from "utils/formatCurrency";
import { orderTotals } from "utils/listTotals";

interface OrderListTotalsProps {
	rows: Order[];
}

/** Orders footer: the count of the filtered orders and the sum of those still live. */
const OrderListTotals: React.FC<OrderListTotalsProps> = ({ rows }) => {
	const { t } = useTranslation();
	const totals = orderTotals(rows);

	return (
		<TableTotals
			count={t("order.totals.count", {
				count: totals.count,
				formatted: formatQuantity(totals.count),
			})}
			items={[
				{
					label: t(totals.excludesDropped ? "order.totals.amountLive" : "common.totals.amount"),
					value: totals.amount,
				},
			]}
		/>
	);
};

export default OrderListTotals;
