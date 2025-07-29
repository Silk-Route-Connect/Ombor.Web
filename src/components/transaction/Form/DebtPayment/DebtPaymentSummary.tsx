import React from "react";
import { Divider, Paper, Stack, Typography } from "@mui/material";
import { translate } from "i18n/i18n";

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
}) => (
	<Paper variant="outlined" sx={{ p: 2 }}>
		<Typography variant="subtitle1" gutterBottom>
			{translate("payDebts.summary")}
		</Typography>
		<Divider sx={{ mb: 1 }} />

		<Stack spacing={1}>
			<Stack direction="row" justifyContent="space-between">
				<Typography>{translate("payDebts.availableLeft")}</Typography>
				<Typography fontWeight={600} color={overAllocate ? "error.main" : "text.secondary"}>
					{remainingAvailable.toLocaleString()}
				</Typography>
			</Stack>

			<Stack direction="row" justifyContent="space-between">
				<Typography>{translate("payDebts.totalDebt")}</Typography>
				<Typography fontWeight={600}>{totalDebt.toLocaleString()}</Typography>
			</Stack>

			<Stack direction="row" justifyContent="space-between">
				<Typography>{translate("payDebts.totalCovered")}</Typography>
				<Typography fontWeight={600}>{totalCovered.toLocaleString()}</Typography>
			</Stack>

			<Stack direction="row" justifyContent="space-between">
				<Typography color="text.secondary">{translate("payDebts.remainingDebt")}</Typography>
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

export default DebtPaymentSummary;
