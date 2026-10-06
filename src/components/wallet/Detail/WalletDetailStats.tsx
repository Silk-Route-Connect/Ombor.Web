import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { Wallet } from "models/wallet";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";

interface WalletDetailStatsProps {
	wallet: Wallet;
}

/** Three detail stat cards per the bundle's `.wd-stats`: balance, our money, advances. */
export const WalletDetailStats: React.FC<WalletDetailStatsProps> = ({ wallet }) => {
	const { t } = useTranslation();

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<AccountBalanceWalletOutlinedIcon />}
				tone="primary"
				caption={t("wallet.detail.stats.balance")}
				value={formatCurrency(wallet.balance)}
				unit="uzs"
			/>
			<StatCard
				icon={<SavingsOutlinedIcon />}
				tone="success"
				caption={t("wallet.detail.stats.ourMoney")}
				value={formatCurrency(wallet.ourMoney)}
				valueColor={wallet.ourMoney < 0 ? "error.main" : "success.main"}
				unit="uzs"
			/>
			<StatCard
				icon={<HandshakeOutlinedIcon />}
				tone="accent"
				caption={t("wallet.detail.stats.advances")}
				value={formatCurrency(wallet.advancesHeld)}
				valueColor={designTokens.saffron700}
				unit="uzs"
			/>
		</StatCardGrid>
	);
};

export default WalletDetailStats;
