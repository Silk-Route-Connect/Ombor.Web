import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { DebtDirection, DebtSummary } from "models/debt";
import { DebtDirectionFilter } from "stores/DebtStore";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

interface DebtSummaryCardsProps {
	summary: DebtSummary;
	/** The page's direction filter — the matching card shows pressed. */
	direction: DebtDirectionFilter;
	onlyOverdue: boolean;
	onToggleDirection: (direction: DebtDirection) => void;
	onToggleOverdue: () => void;
}

/**
 * Four current-state cards (the bundle's `.debt-kpis`), all served: «Нам должны»
 * / «Мы должны» are net partner positions (the same figures as Partners and the
 * dashboard), «Просрочено» the unpaid documents past their due date, «Итог
 * расчётов» the difference — colour-neutral with a direction word, as on the
 * Partners strip (pattern 4, DR-27: an aggregate net carries no colour).
 *
 * The first three are also the page's direction and «просрочено» filters (a
 * pressed card shows ✓; pressing it again lifts the filter). Unlike Payments the
 * figures stay money — the totals are the point of this page — and they are the
 * served totals, so they never follow the filters. «Итог расчётов» filters nothing.
 */
export const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({
	summary,
	direction,
	onlyOverdue,
	onToggleDirection,
	onToggleOverdue,
}) => {
	const { t } = useTranslation();
	const pastDue = summary.unpaidDocuments.pastDue;

	return (
		<StatCardGrid columns={4} label={t("debt.summary.label")}>
			<StatCard
				icon={<ArrowDownwardIcon />}
				tone="success"
				caption={t("debt.summary.receivable")}
				value={formatCurrency(summary.receivable)}
				valueColor="success.main"
				unit="uzs"
				footer={t("partner.summary.receivableSub", { count: summary.receivablePartnerCount })}
				onClick={() => onToggleDirection("Receivable")}
				active={direction === "Receivable"}
				activeColor="success.main"
			/>
			<StatCard
				icon={<ArrowUpwardIcon />}
				tone="danger"
				caption={t("debt.summary.payable")}
				value={formatCurrency(summary.payable)}
				valueColor="error.main"
				unit="uzs"
				footer={t("partner.summary.payableSub", { count: summary.payablePartnerCount })}
				onClick={() => onToggleDirection("Payable")}
				active={direction === "Payable"}
				activeColor="error.main"
			/>
			<StatCard
				icon={<ReportProblemOutlinedIcon />}
				tone="danger"
				caption={t("debt.summary.overdue")}
				value={formatCurrency(pastDue)}
				valueColor={pastDue > 0 ? "error.main" : "text.primary"}
				unit="uzs"
				footer={t("debt.summary.txCount", { count: summary.unpaidDocuments.pastDueCount })}
				onClick={onToggleOverdue}
				active={onlyOverdue}
				activeColor="error.main"
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
