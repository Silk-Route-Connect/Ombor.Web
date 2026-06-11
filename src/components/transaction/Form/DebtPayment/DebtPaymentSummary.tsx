import React from "react";
import { useTranslation } from "react-i18next";

import { Divider, Paper, Stack, Typography } from "@mui/material";

interface DebtPaymentSummaryProps {
	totalDebt: number;
	totalCovered: number;
	remainingAvailable: number;
	debtLeft: number;
	overAllocate: boolean;
}

const DebtPaymentSummary: React.FC<DebtPaymentSummaryProps> = ({
	totalDebt,
	totalCovered,
	remainingAvailable,
	debtLeft,
	overAllocate,
}) => {
	const { t } = useTranslation();

	return (
		<Paper variant="outlined" sx={{ p: 2 }}>
			<Typography variant="subtitle1" gutterBottom>
				{t("payDebts.summary")}
			</Typography>
			<Divider sx={{ mb: 1 }} />

			<Stack spacing={1}>
				<Stack direction="row" justifyContent="space-between">
					<Typography>{t("payDebts.availableLeft")}</Typography>
					<Typography fontWeight={600} color={overAllocate ? "error.main" : "text.secondary"}>
						{remainingAvailable.toLocaleString()}
					</Typography>
				</Stack>

				<Stack direction="row" justifyContent="space-between">
					<Typography>{t("payDebts.totalDebt")}</Typography>
					<Typography fontWeight={600}>{totalDebt.toLocaleString()}</Typography>
				</Stack>

				<Stack direction="row" justifyContent="space-between">
					<Typography>{t("payDebts.totalCovered")}</Typography>
					<Typography fontWeight={600}>{totalCovered.toLocaleString()}</Typography>
				</Stack>

				<Stack direction="row" justifyContent="space-between">
					<Typography color="text.secondary">{t("payDebts.remainingDebt")}</Typography>
					<Typography
						fontWeight={600}
						color={remainingAvailable === 0 ? "text.secondary" : "warning.main"}
					>
						{debtLeft.toLocaleString()}
					</Typography>
				</Stack>
			</Stack>
		</Paper>
	);
};

export default DebtPaymentSummary;
