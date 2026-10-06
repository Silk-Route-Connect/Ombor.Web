import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { PaymentDirection } from "models/payment";
import { PaymentSummary } from "stores/PaymentStore";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

interface PaymentSummaryStripProps {
	/** Null while the list is loading or failed — the cards show «—», never a fake 0. */
	summary: PaymentSummary | null;
	/** Active direction toggle (`"all"` when none). */
	directionFilter: PaymentDirection | "all";
	/** Toggle the table's direction filter (click the active card again to clear). */
	onToggle: (direction: PaymentDirection) => void;
}

/**
 * Three summary cards (the bundle's `.pay-stats`): income · expense · count.
 * The Приход / Расход cards toggle-filter the table by direction (PAY-3) — they
 * total over the scoped view (type / wallet / search), not the direction filter,
 * so they stay stable toggle targets; click the active card again to clear.
 */
export const PaymentSummaryStrip: React.FC<PaymentSummaryStripProps> = ({
	summary,
	directionFilter,
	onToggle,
}) => {
	const { t } = useTranslation();
	const money = (value: number): string => (summary ? formatCurrency(value) : t("common.dash"));

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<ArrowDownwardIcon />}
				tone="success"
				caption={t("payment.summary.income")}
				value={money(summary?.income ?? 0)}
				valueColor="success.main"
				unit={summary ? "uzs" : undefined}
				onClick={() => onToggle("Income")}
				active={directionFilter === "Income"}
				activeColor="success.main"
			/>
			<StatCard
				icon={<ArrowUpwardIcon />}
				tone="danger"
				caption={t("payment.summary.expense")}
				value={money(summary?.expense ?? 0)}
				valueColor="error.main"
				unit={summary ? "uzs" : undefined}
				onClick={() => onToggle("Expense")}
				active={directionFilter === "Expense"}
				activeColor="error.main"
			/>
			<StatCard
				icon={<ReceiptLongOutlinedIcon />}
				tone="primary"
				caption={t("payment.summary.count")}
				value={summary ? summary.count : t("common.dash")}
			/>
		</StatCardGrid>
	);
};

export default PaymentSummaryStrip;
