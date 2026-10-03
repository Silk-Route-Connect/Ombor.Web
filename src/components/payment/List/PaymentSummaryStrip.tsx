import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentDirection } from "models/payment";
import { PaymentSummary } from "stores/PaymentStore";
import { chipTokens, designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

interface PaymentSummaryStripProps {
	summary: PaymentSummary;
	/** Active direction toggle (`"all"` when none). */
	directionFilter: PaymentDirection | "all";
	/** Toggle the table's direction filter (click the active card again to clear). */
	onToggle: (direction: PaymentDirection) => void;
}

const Card: React.FC<{
	icon: React.ReactNode;
	iconBg: string;
	iconColor: string;
	caption: string;
	value: React.ReactNode;
	valueColor?: string;
	clickable?: boolean;
	active?: boolean;
	/** Border / arrow colour when active (and the hover border for clickable cards). */
	accentColor?: string;
	onClick?: () => void;
}> = ({
	icon,
	iconBg,
	iconColor,
	caption,
	value,
	valueColor,
	clickable,
	active,
	accentColor,
	onClick,
}) => (
	<Paper
		elevation={1}
		component={clickable ? ButtonBase : "div"}
		onClick={onClick}
		aria-pressed={clickable ? Boolean(active) : undefined}
		sx={{
			width: "100%",
			justifyContent: "flex-start",
			textAlign: "left",
			fontFamily: "inherit",
			position: "relative",
			display: "flex",
			alignItems: "center",
			gap: "14px",
			border: "1px solid",
			borderColor: active && accentColor ? accentColor : "divider",
			borderRadius: "12px",
			p: "16px 20px",
			cursor: clickable ? "pointer" : "default",
			transition: "box-shadow .15s, border-color .15s, transform .15s",
			...(active && { boxShadow: 8 }),
			...(clickable && {
				"&:hover": {
					boxShadow: 8,
					borderColor: accentColor ?? designTokens.gray300,
					transform: "translateY(-1px)",
					"& .go-arrow": { opacity: 1 },
				},
			}),
		}}
	>
		{clickable && (
			<Box
				className="go-arrow"
				sx={{
					position: "absolute",
					top: 13,
					right: 13,
					color: active && accentColor ? accentColor : "text.disabled",
					opacity: active ? 1 : 0,
					transition: "opacity .15s",
				}}
			>
				<NorthEastIcon sx={{ fontSize: 15 }} />
			</Box>
		)}
		<Box
			sx={{
				width: 42,
				height: 42,
				flex: "0 0 auto",
				borderRadius: "11px",
				display: "grid",
				placeItems: "center",
				bgcolor: iconBg,
				color: iconColor,
			}}
		>
			{icon}
		</Box>
		<Box>
			<Typography sx={{ fontSize: 13, color: "text.secondary" }}>{caption}</Typography>
			<Typography
				sx={{
					...numericSx,
					fontSize: 24,
					fontWeight: 700,
					letterSpacing: "-0.02em",
					mt: "3px",
					lineHeight: 1.1,
					color: valueColor ?? "text.primary",
				}}
			>
				{value}
			</Typography>
		</Box>
	</Paper>
);

const Uzs: React.FC = () => (
	<Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: "text.disabled", ml: "5px" }}>
		UZS
	</Box>
);

/**
 * Three summary cards (the bundle's `.pay-stats`): income · expense · count.
 * The Приход / Расход cards toggle-filter the table by direction (PAY-3) — they
 * total over the scoped view (type / wallet / search), not the direction filter,
 * so they stay stable toggle targets; click the active card again to clear.
 */
export const PaymentSummaryStrip: React.FC<PaymentSummaryStripProps> = ({
	summary,
	directionFilter,
	onToggle,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
				gap: "16px",
				mb: "20px",
			}}
		>
			<Card
				icon={<ArrowDownwardIcon sx={{ fontSize: 21 }} />}
				iconBg={chipTokens.income.bg}
				iconColor={chipTokens.income.color}
				caption={t("payment.summary.income")}
				value={
					<>
						{formatCurrency(summary.income)}
						<Uzs />
					</>
				}
				valueColor="success.main"
				clickable
				active={directionFilter === "Income"}
				accentColor="success.main"
				onClick={() => onToggle("Income")}
			/>
			<Card
				icon={<ArrowUpwardIcon sx={{ fontSize: 21 }} />}
				iconBg={chipTokens.expense.bg}
				iconColor={chipTokens.expense.color}
				caption={t("payment.summary.expense")}
				value={
					<>
						{formatCurrency(summary.expense)}
						<Uzs />
					</>
				}
				valueColor="error.main"
				clickable
				active={directionFilter === "Expense"}
				accentColor="error.main"
				onClick={() => onToggle("Expense")}
			/>
			<Card
				icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />}
				iconBg={chipTokens.teal.bg}
				iconColor={chipTokens.teal.color}
				caption={t("payment.summary.count")}
				value={summary.count}
			/>
		</Box>
	);
};

export default PaymentSummaryStrip;
