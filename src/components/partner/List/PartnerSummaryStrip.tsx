import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { isReady, Loadable } from "helpers/Loading";
import { DebtSummary } from "models/debt";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";

interface PartnerSummaryStripProps {
	/** The served debt totals — the same figures as «Долги» and the dashboard. */
	summary: Loadable<DebtSummary>;
	activeCount: number;
}

/**
 * List summary strip: «Нам должны» / «Мы должны» / «Итог расчётов» — the served
 * net partner positions (archived partners included), the same figures as
 * «Долги» and the dashboard. These are the company's own aggregate positions,
 * so colour is owner-POV (DR-27): money coming to us reads green, money we owe
 * red; net is neutral with a direction word. Aggregates carry no +/− sign —
 * only a single partner's balance is signed + partner-POV. «—» until the served
 * totals are in.
 */
export const PartnerSummaryStrip: React.FC<PartnerSummaryStripProps> = ({
	summary: loadable,
	activeCount,
}) => {
	const { t } = useTranslation();
	const summary = isReady(loadable) ? loadable : null;
	const dash = t("common.dash");

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<ArrowDownwardIcon />}
				tone="success"
				caption={t("partner.summary.receivable")}
				value={summary ? formatCurrency(summary.receivable) : dash}
				valueColor="success.main"
				unit={summary ? "uzs" : undefined}
				footer={
					summary
						? t("partner.summary.receivableSub", { count: summary.receivablePartnerCount })
						: dash
				}
			/>
			<StatCard
				icon={<ArrowUpwardIcon />}
				tone="danger"
				caption={t("partner.summary.payable")}
				value={summary ? formatCurrency(summary.payable) : dash}
				valueColor="error.main"
				unit={summary ? "uzs" : undefined}
				footer={
					summary ? t("partner.summary.payableSub", { count: summary.payablePartnerCount }) : dash
				}
			/>
			<StatCard
				icon={<BalanceOutlinedIcon />}
				tone="primary"
				caption={t("partner.summary.net")}
				value={summary ? formatCurrency(Math.abs(summary.net)) : dash}
				unit={summary ? "uzs" : undefined}
				footer={
					summary
						? t("partner.summary.netSub", {
								direction: t(
									summary.net >= 0
										? "partner.summary.netInOurFavor"
										: "partner.summary.netInPartnerFavor",
								),
								count: activeCount,
							})
						: dash
				}
			/>
		</StatCardGrid>
	);
};

export default PartnerSummaryStrip;
