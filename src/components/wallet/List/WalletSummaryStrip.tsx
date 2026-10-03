import React from "react";
import { useTranslation } from "react-i18next";
import InfoHint from "components/shared/InfoHint/InfoHint";
import { WalletSummary } from "stores/WalletStore";
import { designTokens, numericSx, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface WalletSummaryStripProps {
	summary: WalletSummary;
}

const CARD_SX = {
	position: "relative",
	overflow: "hidden",
	bgcolor: "background.paper",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: "12px",
	boxShadow: 1,
	p: "18px 20px",
	"&::before": {
		content: '""',
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: "3px",
	},
} as const;

const Cap: React.FC<{ color: string; label: string; hint?: string }> = ({ color, label, hint }) => (
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
		<Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: color }} />
		{label}
		{hint && <InfoHint text={hint} />}
	</Box>
);

const Value: React.FC<{ color: string; text: string }> = ({ color, text }) => (
	<Typography
		sx={{
			...typeScale.numStrong,
			lineHeight: 1,
			mt: "10px",
			color,
		}}
	>
		{text}
		<Box
			component="span"
			sx={{ fontSize: 12.5, fontWeight: 600, color: "text.disabled", ml: "7px" }}
		>
			UZS
		</Box>
	</Typography>
);

/**
 * List summary strip per the bundle's `.wal-sum`: total balance (primary),
 * "our money" (success), partner advances (saffron). Totals span EVERY wallet —
 * archived ones still holding money are counted (rule 31).
 */
export const WalletSummaryStrip: React.FC<WalletSummaryStripProps> = ({ summary }) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
				gap: "16px",
				mb: "22px",
			}}
		>
			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "primary.main" } }}>
				<Cap color="primary.main" label={t("wallet.summary.balance")} />
				<Value color="text.primary" text={formatCurrency(summary.totalBalance)} />
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "success.main" } }}>
				<Cap
					color="success.main"
					label={t("wallet.summary.ourMoney")}
					hint={t("wallet.summary.ourMoneyHint")}
				/>
				<Value color="success.main" text={formatCurrency(summary.totalOurMoney)} />
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "secondary.main" } }}>
				<Cap
					color="secondary.main"
					label={t("wallet.summary.advances")}
					hint={t("wallet.summary.advancesHint")}
				/>
				<Value color={designTokens.saffron700} text={formatCurrency(summary.totalAdvances)} />
			</Box>
		</Box>
	);
};

export default WalletSummaryStrip;
