import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { isReady, Loadable } from "helpers/Loading";
import { DebtSummary } from "models/debt";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

interface PartnerSummaryStripProps {
	/** The served debt totals — the same figures as «Долги» and the dashboard. */
	summary: Loadable<DebtSummary>;
	activeCount: number;
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

/** The figure with its unit, or «—» until the served totals are in. */
const Value: React.FC<{ color: string; text: string | null }> = ({ color, text }) => (
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
		{text ?? "—"}
		{text !== null && <UzsUnit />}
	</Typography>
);

const Sub: React.FC<{ text: string | null }> = ({ text }) => (
	<Typography sx={{ fontSize: 12, color: "text.disabled", mt: "8px" }}>{text ?? "—"}</Typography>
);

/**
 * List summary strip: «Нам должны» / «Мы должны» / «Итог расчётов» — the served
 * net partner positions (archived partners included), the same figures as
 * «Долги» and the dashboard. These are the company's own aggregate positions,
 * so colour is owner-POV (DR-27): money coming to us reads green, money we owe
 * red; net is neutral with a direction word. Aggregates carry no +/− sign —
 * only a single partner's balance is signed + partner-POV.
 */
export const PartnerSummaryStrip: React.FC<PartnerSummaryStripProps> = ({
	summary: loadable,
	activeCount,
}) => {
	const { t } = useTranslation();
	const summary = isReady(loadable) ? loadable : null;
	const money = (value: number | undefined): string | null =>
		value === undefined ? null : formatCurrency(value);

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
				<Value color="success.main" text={money(summary?.receivable)} />
				<Sub
					text={
						summary && t("partner.summary.receivableSub", { count: summary.receivablePartnerCount })
					}
				/>
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "error.main" } }}>
				<Cap color="error.main" label={t("partner.summary.payable")} />
				<Value color="error.main" text={money(summary?.payable)} />
				<Sub
					text={summary && t("partner.summary.payableSub", { count: summary.payablePartnerCount })}
				/>
			</Box>

			<Box sx={{ ...CARD_SX, "&::before": { ...CARD_SX["&::before"], bgcolor: "primary.main" } }}>
				<Cap color="primary.main" label={t("partner.summary.net")} />
				<Value color="text.primary" text={summary && formatCurrency(Math.abs(summary.net))} />
				<Sub
					text={
						summary &&
						t("partner.summary.netSub", {
							direction: t(
								summary.net >= 0
									? "partner.summary.netInOurFavor"
									: "partner.summary.netInPartnerFavor",
							),
							count: activeCount,
						})
					}
				/>
			</Box>
		</Box>
	);
};

export default PartnerSummaryStrip;
