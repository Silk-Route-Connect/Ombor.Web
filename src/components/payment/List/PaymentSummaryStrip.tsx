import React from "react";
import { useTranslation } from "react-i18next";
import { PaymentSummary } from "stores/PaymentStore";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import NorthEastIcon from "@mui/icons-material/NorthEast";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { Box, Paper, Typography } from "@mui/material";

interface PaymentSummaryStripProps {
	summary: PaymentSummary;
}

const Card: React.FC<{
	icon: React.ReactNode;
	iconBg: string;
	iconColor: string;
	caption: string;
	value: React.ReactNode;
	valueColor?: string;
}> = ({ icon, iconBg, iconColor, caption, value, valueColor }) => (
	<Paper
		elevation={1}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "14px",
			border: "1px solid",
			borderColor: "divider",
			borderRadius: "12px",
			p: "16px 20px",
		}}
	>
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
					fontWeight: 800,
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

/** Three summary cards per the bundle's `.pay-stats`: income, expense, count. */
export const PaymentSummaryStrip: React.FC<PaymentSummaryStripProps> = ({ summary }) => {
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
				icon={<SouthEastIcon sx={{ fontSize: 21 }} />}
				iconBg={designTokens.successBg}
				iconColor="#17835A"
				caption={t("payment.summary.income")}
				value={
					<>
						{formatCurrency(summary.income)}
						<Uzs />
					</>
				}
				valueColor="success.main"
			/>
			<Card
				icon={<NorthEastIcon sx={{ fontSize: 21 }} />}
				iconBg={designTokens.errorBg}
				iconColor="#C53D31"
				caption={t("payment.summary.expense")}
				value={
					<>
						{formatCurrency(summary.expense)}
						<Uzs />
					</>
				}
				valueColor="error.main"
			/>
			<Card
				icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />}
				iconBg={designTokens.primarySoft}
				iconColor="#12676B"
				caption={t("payment.summary.count")}
				value={summary.count}
			/>
		</Box>
	);
};

export default PaymentSummaryStrip;
