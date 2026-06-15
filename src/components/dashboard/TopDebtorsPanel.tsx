import React from "react";
import { useTranslation } from "react-i18next";
import { DashboardDebtor } from "models/dashboard";
import { designTokens, numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Paper, Typography } from "@mui/material";

interface Props {
	debtors: DashboardDebtor[];
	onOpenDebtor: (partnerId: number) => void;
	onAllPartners: () => void;
}

const Avatar: React.FC<{ name: string }> = ({ name }) => (
	<Box
		sx={{
			width: 36,
			height: 36,
			flex: "0 0 auto",
			borderRadius: "50%",
			display: "grid",
			placeItems: "center",
			bgcolor: "primary.light",
			color: "primary.main",
			fontSize: 14,
			fontWeight: 700,
		}}
	>
		{name.trim().charAt(0).toUpperCase()}
	</Box>
);

/**
 * «Топ должников» — the five partners with the largest outstanding receivable.
 * Rows deep-link to the partner detail; a footer links to the full partner list.
 * Amounts are red (we are owed) — colour only, no signs (locked pattern 4).
 */
const TopDebtorsPanel: React.FC<Props> = ({ debtors, onOpenDebtor, onAllPartners }) => {
	const { t } = useTranslation();

	return (
		<Paper
			elevation={1}
			sx={{
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				display: "flex",
				flexDirection: "column",
				minWidth: 0,
			}}
		>
			<Box sx={{ p: "16px 20px 4px" }}>
				<Typography sx={{ fontSize: 15, fontWeight: 600 }}>
					{t("dashboard.topDebtors.title")}
				</Typography>
			</Box>

			<Box sx={{ p: "4px 0" }}>
				{debtors.map((d) => (
					<Box
						key={d.partnerId}
						onClick={() => onOpenDebtor(d.partnerId)}
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							p: "9px 20px",
							cursor: "pointer",
							"&:hover": { bgcolor: designTokens.gray25 },
						}}
					>
						<Avatar name={d.name} />
						<Box sx={{ flex: 1, minWidth: 0 }}>
							<Typography
								sx={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis" }}
							>
								{d.name}
							</Typography>
							<Typography
								sx={{
									fontSize: 12,
									color: "text.disabled",
									overflow: "hidden",
									textOverflow: "ellipsis",
								}}
							>
								{d.company ?? t("dashboard.topDebtors.noCompany")}
							</Typography>
						</Box>
						<Box
							component="span"
							sx={{ ...numericSx, fontWeight: 700, fontSize: 14.5, color: "error.main" }}
						>
							{formatCurrency(d.amount)}
						</Box>
					</Box>
				))}
			</Box>

			<Box
				onClick={onAllPartners}
				sx={{
					mt: "auto",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "6px",
					p: "13px",
					borderTop: "1px solid",
					borderColor: "divider",
					color: "primary.main",
					fontSize: 13,
					fontWeight: 600,
					cursor: "pointer",
					"&:hover": { bgcolor: "primary.light" },
				}}
			>
				{t("dashboard.topDebtors.allPartners")}
				<ChevronRightIcon sx={{ fontSize: 15 }} />
			</Box>
		</Paper>
	);
};

export default TopDebtorsPanel;
