import React from "react";
import { useTranslation } from "react-i18next";
import TableTotals from "components/shared/Table/TableTotals";
import { PaymentRecord } from "models/payment";
import { formatQuantity } from "utils/formatCurrency";
import { directionTotals } from "utils/listTotals";

interface PaymentListTotalsProps {
	rows: PaymentRecord[];
}

/** Payments footer: the count, money in (green) and money out (red) of the shown payments. */
const PaymentListTotals: React.FC<PaymentListTotalsProps> = ({ rows }) => {
	const { t } = useTranslation();
	const totals = directionTotals(
		rows,
		(p) => p.amount,
		(p) => p.direction === "Income",
	);

	return (
		<TableTotals
			count={t("payment.totals.count", {
				count: totals.count,
				formatted: formatQuantity(totals.count),
			})}
			items={[
				{ label: t("common.totals.income"), value: totals.income, tone: "income" },
				{ label: t("common.totals.expense"), value: totals.expense, tone: "expense" },
			]}
		/>
	);
};

export default PaymentListTotals;
