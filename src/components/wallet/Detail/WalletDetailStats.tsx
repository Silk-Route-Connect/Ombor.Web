import React from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "models/wallet";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Paper, Typography } from "@mui/material";

interface WalletDetailStatsProps {
	wallet: Wallet;
}

const Stat: React.FC<{
	accent: string;
	dot: string;
	caption: string;
	value: string;
	valueColor: string;
}> = ({ accent, dot, caption, value, valueColor }) => (
	<Paper
		elevation={1}
		sx={{
			position: "relative",
			overflow: "hidden",
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			p: "17px 20px",
			"&::before": {
				content: '""',
				position: "absolute",
				left: 0,
				top: 0,
				bottom: 0,
				width: "3px",
				bgcolor: accent,
			},
		}}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				fontSize: 12.5,
				fontWeight: 600,
				color: "text.secondary",
			}}
		>
			<Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dot }} />
			{caption}
		</Box>
		<Typography
			sx={{
				...numericSx,
				fontSize: 26,
				fontWeight: 800,
				letterSpacing: "-0.025em",
				lineHeight: 1,
				mt: "10px",
				color: valueColor,
			}}
		>
			{value}
			<Box
				component="span"
				sx={{ fontSize: 12.5, fontWeight: 600, color: "text.disabled", ml: "6px" }}
			>
				UZS
			</Box>
		</Typography>
	</Paper>
);

/** Three detail stat cards per the bundle's `.wd-stats`: balance, our money, advances. */
export const WalletDetailStats: React.FC<WalletDetailStatsProps> = ({ wallet }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
				gap: "16px",
				mb: "22px",
			}}
		>
			<Stat
				accent="#12676B"
				dot="#12676B"
				caption={t("wallet.detail.stats.balance")}
				value={formatCurrency(wallet.balance)}
				valueColor="primary.main"
			/>
			<Stat
				accent="#17835A"
				dot="#17835A"
				caption={t("wallet.detail.stats.ourMoney")}
				value={formatCurrency(wallet.ourMoney)}
				valueColor="success.main"
			/>
			<Stat
				accent="#D88A1E"
				dot="#D88A1E"
				caption={t("wallet.detail.stats.advances")}
				value={formatCurrency(wallet.advancesHeld)}
				valueColor={designTokens.saffron700}
			/>
		</Box>
	);
};

export default WalletDetailStats;
