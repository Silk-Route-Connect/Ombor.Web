import React from "react";
import { useTranslation } from "react-i18next";
import { PartnerSummary } from "stores/PartnerStore";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface PartnerSummaryStripProps {
	summary: PartnerSummary;
}

const CARD_SX = {
	position: "relative",
	overflow: "hidden",
	bgcolor: "background.paper",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: "12px",
	boxShadow: 1,
	p: "16px 18px",
	"&::before": {
		content: '""',
		position: "absolute",
		left: 0,
		top: 0,
		bottom: 0,
		width: "3px",
	},
} as const;

const Cap: React.FC<{ color: string; label: string }> = ({ color, label }) => (
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
	</Box>
);

const Value: React.FC<{ color: string; text: string }> = ({ color, text }) => (
	<Typography
		sx={{
			...numericSx,
			fontWeight: 700,
			fontSize: 26,
			letterSpacing: "-0.02em",
			lineHeight: 1,
			mt: "9px",
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

const Sub: React.FC<{ text: string }> = ({ text }) => (
	<Typography sx={{ fontSize: 12, color: "text.disabled", mt: "8px" }}>{text}</Typography>
);

/** List summary strip: receivables / payables / net position (locked pattern 4 colors). */
export const PartnerSummaryStrip: React.FC<PartnerSummaryStripProps> = ({ summary }) => {
	const { t } = useTranslation();
	const netColor =
		summary.net > 0 ? "success.main" : summary.net < 0 ? "error.main" : "text.secondary";
	const netText =
		summary.net === 0
			? formatCurrency(0)
			: `${summary.net > 0 ? "+" : "−"}${formatCurrency(Math.abs(summary.net))}`;

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
				gap: "14px",
				mb: "18px",
			}}
		>
			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "success.main" } }}>
				<Cap color="success.main" label={t("partner.summary.receivable")} />
				<Value color="success.main" text={`+${formatCurrency(summary.receivable)}`} />
				<Sub text={t("partner.summary.receivableSub", { count: summary.receivableCount })} />
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "error.main" } }}>
				<Cap color="error.main" label={t("partner.summary.payable")} />
				<Value color="error.main" text={`−${formatCurrency(summary.payable)}`} />
				<Sub text={t("partner.summary.payableSub", { count: summary.payableCount })} />
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "primary.main" } }}>
				<Cap color="primary.main" label={t("partner.summary.net")} />
				<Value color={netColor} text={netText} />
				<Sub
					text={t("partner.summary.netSub", {
						direction: t(
							summary.net >= 0
								? "partner.summary.netInOurFavor"
								: "partner.summary.netInPartnerFavor",
						),
						count: summary.activeCount,
					})}
				/>
			</Box>
		</Box>
	);
};

export default PartnerSummaryStrip;
