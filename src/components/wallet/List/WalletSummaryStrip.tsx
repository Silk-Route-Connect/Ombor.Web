import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { WalletSummary } from "stores/WalletStore";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

interface WalletSummaryStripProps {
	summary: WalletSummary;
}

/**
 * List summary strip per the bundle's `.wal-sum`: total balance (primary),
 * "our money" (success), partner advances (saffron). Totals span EVERY wallet —
 * archived ones still holding money are counted (rule 31).
 */
export const WalletSummaryStrip: React.FC<WalletSummaryStripProps> = ({ summary }) => {
	const { t } = useTranslation();

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<AccountBalanceWalletOutlinedIcon />}
				tone="primary"
				caption={t("wallet.summary.balance")}
				value={formatCurrency(summary.totalBalance)}
				unit="uzs"
			/>
			<StatCard
				icon={<SavingsOutlinedIcon />}
				tone="success"
				caption={t("wallet.summary.ourMoney")}
				hint={t("wallet.summary.ourMoneyHint")}
				value={formatCurrency(summary.totalOurMoney)}
				// A shortfall is not good news: below zero the figure reads red.
				valueColor={summary.totalOurMoney < 0 ? "error.main" : "success.main"}
				unit="uzs"
			/>
			<StatCard
				icon={<HandshakeOutlinedIcon />}
				tone="accent"
				caption={t("wallet.summary.advances")}
				hint={t("wallet.summary.advancesHint")}
				value={formatCurrency(summary.totalAdvances)}
				valueColor={designTokens.saffron700}
				unit="uzs"
			/>
		</StatCardGrid>
	);
};

export default WalletSummaryStrip;
