import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import UzsUnit from "components/shared/Money/UzsUnit";
import { DebtSummary } from "stores/DebtStore";
import { ChipTokenKey, designTokens, typeScale } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import BalanceOutlinedIcon from "@mui/icons-material/BalanceOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

type CardSpec = {
	key: "receivable" | "payable" | "overdue" | "net";
	icon: React.ReactNode;
	caption: string;
	value: string;
	valueColor: string;
	count: number;
	pill: { token: ChipTokenKey; icon?: typeof ReportProblemOutlinedIcon };
	clickable: boolean;
};

interface DebtSummaryCardsProps {
	summary: DebtSummary;
	onCard: (card: "receivable" | "payable" | "overdue") => void;
}

const Card: React.FC<{ spec: CardSpec; countLabel: string; onClick?: () => void }> = ({
	spec,
	countLabel,
	onClick,
}) => (
	<Paper
		elevation={1}
		component={spec.clickable ? ButtonBase : "div"}
		onClick={onClick}
		sx={{
			display: "block",
			width: "100%",
			textAlign: "left",
			fontFamily: "inherit",
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
				fontSize: 13,
				color: "text.secondary",
			}}
		>
			<Box sx={{ display: "inline-flex", color: "text.disabled" }}>{spec.icon}</Box>
			{spec.caption}
		</Box>
		<Typography
			sx={{
				...typeScale.numStrong,
				mt: "9px",
				lineHeight: 1.05,
				color: spec.valueColor,
			}}
		>
			{spec.value}
			<UzsUnit />
		</Typography>
		<Box sx={{ mt: "10px" }}>
			<StatusPill token={spec.pill.token} icon={spec.pill.icon} label={countLabel} />
		</Box>
	</Paper>
);

/** Four current-state summary cards (the bundle's `.debt-kpis`); no trends. */
export const DebtSummaryCards: React.FC<DebtSummaryCardsProps> = ({ summary, onCard }) => {
	const { t } = useTranslation();

	const cards: CardSpec[] = [
		{
			key: "receivable",
			icon: <ArrowDownwardIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.receivable"),
			value: formatCurrency(summary.receivable),
			valueColor: "success.main",
			count: summary.receivableCount,
			pill: { token: "success" },
			clickable: true,
		},
		{
			key: "payable",
			icon: <ArrowUpwardIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.payable"),
			value: formatCurrency(summary.payable),
			valueColor: "error.main",
			count: summary.payableCount,
			pill: { token: "danger" },
			clickable: true,
		},
		{
			key: "overdue",
			icon: <ReportProblemOutlinedIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.overdue"),
			value: formatCurrency(summary.overdue),
			valueColor: summary.overdue > 0 ? "error.main" : "text.primary",
			count: summary.overdueCount,
			pill: { token: "overdue", icon: ReportProblemOutlinedIcon },
			clickable: true,
		},
		{
			key: "net",
			icon: <BalanceOutlinedIcon sx={{ fontSize: 15 }} />,
			caption: t("debt.summary.net"),
			value: formatCurrency(Math.abs(summary.net)),
			valueColor: summary.net < 0 ? "error.main" : "success.main",
			count: summary.totalCount,
			pill: { token: "teal" },
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
					countLabel={t("debt.summary.txCount", { count: spec.count })}
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
