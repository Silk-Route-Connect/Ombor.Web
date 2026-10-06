import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { DebtSummary } from "models/debt";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

interface DebtSummaryCardsProps {
	summary: DebtSummary;
	onCard: (card: "receivable" | "payable" | "overdue") => void;
}

/**
 * Four current-state cards (the bundle's `.debt-kpis`), all served: «Нам должны»
 * / «Мы должны» are net partner positions (the same figures as Partners and the
 * dashboard), «Просрочено» the unpaid documents past their due date, «Итог
 * расчётов» the difference — colour-neutral with a direction word, as on the
 * Partners strip (pattern 4, DR-27: an aggregate net carries no colour).
 */
export const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({ summary, onCard }) => {
	const { t } = useTranslation();
	const pastDue = summary.unpaidDocuments.pastDue;

	return (
		<StatCardGrid columns={4}>
			<StatCard
				icon={<ArrowDownwardIcon />}
				tone="success"
				caption={t("debt.summary.receivable")}
				value={formatCurrency(summary.receivable)}
				valueColor="success.main"
				unit="uzs"
				footer={t("partner.summary.receivableSub", { count: summary.receivablePartnerCount })}
				onClick={() => onCard("receivable")}
			/>
			<StatCard
				icon={<ArrowUpwardIcon />}
				tone="danger"
				caption={t("debt.summary.payable")}
				value={formatCurrency(summary.payable)}
				valueColor="error.main"
				unit="uzs"
				footer={t("partner.summary.payableSub", { count: summary.payablePartnerCount })}
				onClick={() => onCard("payable")}
			/>
			<StatCard
				icon={<ReportProblemOutlinedIcon />}
				tone="danger"
				caption={t("debt.summary.overdue")}
				value={formatCurrency(pastDue)}
				valueColor={pastDue > 0 ? "error.main" : "text.primary"}
				unit="uzs"
				footer={t("debt.summary.txCount", { count: summary.unpaidDocuments.pastDueCount })}
				onClick={() => onCard("overdue")}
			/>
			<StatCard
				icon={<BalanceOutlinedIcon />}
				tone="primary"
				caption={t("debt.summary.net")}
				value={formatCurrency(Math.abs(summary.net))}
				unit="uzs"
				footer={t("debt.summary.netSub", {
					direction: t(
						summary.net >= 0
							? "partner.summary.netInOurFavor"
							: "partner.summary.netInPartnerFavor",
					),
					partners: t("debt.summary.partners", {
						count: summary.receivablePartnerCount + summary.payablePartnerCount,
					}),
				})}
			/>
		</StatCardGrid>
	);
};

export default DebtSummaryCards;
