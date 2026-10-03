import React from "react";
import { useTranslation } from "react-i18next";
import TableTotals, { TableTotalItem } from "components/shared/Table/TableTotals";
import { TransactionRecord } from "models/transaction";
import { formatQuantity } from "utils/formatCurrency";
import { transactionTotals } from "utils/listTotals";

interface TransactionListTotalsProps {
	rows: TransactionRecord[];
}

/** Sales / Supplies footer: documents · Сумма · Возвраты (when any) · Оплачено · Осталось оплатить. */
const TransactionListTotals: React.FC<TransactionListTotalsProps> = ({ rows }) => {
	const { t } = useTranslation();
	const totals = transactionTotals(rows);

	const items: TableTotalItem[] = [
		{ label: t("common.totals.amount"), value: totals.amount },
		...(totals.refunds > 0 ? [{ label: t("common.totals.refunds"), value: totals.refunds }] : []),
		{ label: t("common.totals.paid"), value: totals.paid },
		{ label: t("common.totals.remaining"), value: totals.remaining },
	];

	return (
		<TableTotals
			count={t("transaction.totals.count", {
				count: totals.count,
				formatted: formatQuantity(totals.count),
			})}
			items={items}
		/>
	);
};

export default TransactionListTotals;
