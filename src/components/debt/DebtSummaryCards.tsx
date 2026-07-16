import React from "react";
import { useTranslation } from "react-i18next";
import { DebtSummary } from "stores/DebtStore";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { Box, Paper, Typography } from "@mui/material";

/** Russian transaction-count pluralization. */
export function txWord(n: number): string {
	const m10 = n % 10;
	const m100 = n % 100;
	if (m10 === 1 && m100 !== 11) return "транзакция";
	if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "транзакции";
	return "транзакций";
}

type CardSpec = {
	key: "receivable" | "payable" | "overdue" | "net";
	icon: React.ReactNode;
	caption: string;
	value: string;
	valueColor: string;
	count: number;
	pill: { bg: string; color: string; icon?: React.ReactNode };
	clickable: boolean;
};

interface DebtSummaryCardsProps {
	summary: DebtSummary;
	onCard: (card: "receivable" | "payable" | "overdue") => void;
}

const Card: React.FC<{ spec: CardSpec; onClick?: () => void }> = ({ spec, onClick }) => (
	<Paper
		elevation={1}
		onClick={onClick}
		sx={{
			position: "relative",
			minWidth: 0,
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			p: "17px 19px",
			cursor: spec.clickable ? "pointer" : "default",
			transition: "box-shadow .15s, border-color .15s, transform .15s",
			...(spec.clickable && {
				"&:hover": {
					boxShadow: 8,
					borderColor: designTokens.gray300,
					transform: "translateY(-1px)",
					"& .go-arrow": { opacity: 1 },
				},
			}),
		}}
	>
		{spec.clickable && (
			<Box
				className="go-arrow"
				sx={{
					position: "absolute",
					top: 15,
					right: 15,
					color: "text.disabled",
					opacity: 0,
					transition: "opacity .15s",
				}}
			>
				<NorthEastIcon sx={{ fontSize: 15 }} />
			</Box>
		)}
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "7px",
				fontSize: 12.5,
				color: "text.secondary",
			}}
		>
			<Box sx={{ display: "inline-flex", color: "text.disabled" }}>{spec.icon}</Box>
			{spec.caption}
		</Box>
		<Typography
			sx={{
				...numericSx,
				fontWeight: 700,
				fontSize: 26,
				letterSpacing: "-0.02em",
				mt: "9px",
				lineHeight: 1.05,
				color: spec.valueColor,
			}}
		>
			{spec.value}
			<Box
				component="span"
				sx={{ fontSize: 12.5, fontWeight: 500, color: "text.disabled", ml: "6px" }}
			>
				UZS
			</Box>
		</Typography>
		<Box sx={{ mt: "10px" }}>
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					fontWeight: 600,
					fontSize: 12,
					px: "8px",
					py: "1px",
					borderRadius: "999px",
					bgcolor: spec.pill.bg,
					color: spec.pill.color,
				}}
			>
				{spec.pill.icon}
				{spec.count} {txWord(spec.count)}
			</Box>
		</Box>
	</Paper>
);

/** Four current-state summary cards (the bundle's `.debt-kpis`); no trends. */
export const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({ summary, onCard }) => {
	const { t } = useTranslation();

	// Colour is partner-POV (receivable red, payable green) — consistent with the
	// partner pages, list summary and dashboard (DR-27). Direction-fixed → hard-coded.
	const cards: CardSpec[] = [
		{
			key: "receivable",
			icon: <NorthEastIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.receivable"),
			value: formatCurrency(summary.receivable),
			valueColor: "error.main",
			count: summary.receivableCount,
			pill: { bg: designTokens.errorBg, color: "#C53D31" },
			clickable: true,
		},
		{
			key: "payable",
			icon: <SouthEastIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.payable"),
			value: formatCurrency(summary.payable),
			valueColor: "success.main",
			count: summary.payableCount,
			pill: { bg: designTokens.successBg, color: "#17835A" },
			clickable: true,
		},
		{
			key: "overdue",
			icon: <ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.overdue"),
			value: formatCurrency(summary.overdue),
			valueColor: "warning.main",
			count: summary.overdueCount,
			pill: {
				bg: designTokens.warningBg,
				color: "#C57E14",
				icon: <ReportProblemOutlinedIcon sx={{ fontSize: 11 }} />,
			},
			clickable: true,
		},
		{
			key: "net",
			icon: <BalanceOutlinedIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.net"),
			value: formatCurrency(Math.abs(summary.net)),
			// Net position is signless and directionless in colour (matches the partner
			// list summary strip); receivable / payable cards carry the direction.
			valueColor: "text.primary",
			count: summary.totalCount,
			pill: { bg: designTokens.primarySoft, color: "#12676B" },
			clickable: false,
		},
	];

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
				gap: "16px",
				mb: "20px",
			}}
		>
			{cards.map((spec) => (
				<Card
					key={spec.key}
					spec={spec}
					onClick={
						spec.clickable
							? () => onCard(spec.key as "receivable" | "payable" | "overdue")
							: undefined
					}
				/>
			))}
		</Box>
	);
};

export default DebtSummaryCards;
