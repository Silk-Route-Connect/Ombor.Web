import React from "react";
import { useTranslation } from "react-i18next";
import { formatNumberWithCommas } from "utils/formatCurrency";

import CreditScoreIcon from "@mui/icons-material/CreditScore";
import { Box, Button, Divider, FormControlLabel, Stack, Switch, Typography } from "@mui/material";

interface PaymentSummaryProps {
	totalDue: number;
	totalPaid: number;
	overpaid: number;
	underpaid: number;
	effectiveOverpaid: number;
	debtPaid: number;
	balanceAfter: number;

	refundChange: boolean;
	canPayDebts: boolean;
	canSaveAdvance: boolean;
	saveAsAdvance: boolean;

	onPayDebts: () => void;
	onSaveAdvanceToggle: (checked: boolean) => void;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
	totalDue,
	totalPaid,
	overpaid,
	underpaid,
	effectiveOverpaid,
	debtPaid,
	balanceAfter,
	refundChange,
	canPayDebts,
	canSaveAdvance,
	saveAsAdvance,
	onPayDebts,
	onSaveAdvanceToggle,
}) => {
	const { t } = useTranslation();

	return (
		<Box border={1} borderColor="divider" borderRadius={2} p={2} bgcolor="background.paper">
			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography>{t("transaction.totalDue")}</Typography>
				<Typography fontWeight={600}>{totalDue.toLocaleString()}</Typography>
			</Stack>

			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography>{t("transaction.totalPaid")}</Typography>
				<Typography fontWeight={600}>{totalPaid.toLocaleString()}</Typography>
			</Stack>

			{debtPaid > 0 && (
				<Stack direction="row" justifyContent="space-between" mb={1}>
					<Typography>{t("payDebts.paidDebt")}</Typography>
					<Typography fontWeight={600}>{debtPaid.toLocaleString()}</Typography>
				</Stack>
			)}

			{overpaid > 0 && (
				<Stack direction="row" justifyContent="space-between" mb={1}>
					<Typography>
						{refundChange ? t("transaction.changeAmount") : t("payment.advancePayment")}
					</Typography>
					<Typography fontWeight={600}>{effectiveOverpaid.toLocaleString()}</Typography>
				</Stack>
			)}

			{underpaid >= 0 && (
				<Stack direction="row" justifyContent="space-between" mb={1}>
					<Typography>{t("transaction.debtAmount")}</Typography>
					<Typography fontWeight={600} color={underpaid > 0 ? "error.main" : "textPrimary"}>
						{underpaid.toLocaleString()}
					</Typography>
				</Stack>
			)}

			<Divider sx={{ my: 1 }} />

			<Stack direction="row" justifyContent="space-between">
				<Typography>{t("payment.partnerBalanceAfter")}</Typography>
				<Typography fontWeight={600} color={balanceAfter < 0 ? "error.main" : "success.main"}>
					{formatNumberWithCommas(balanceAfter)}
				</Typography>
			</Stack>

			{canPayDebts && (
				<Stack>
					<Button
						sx={{ mt: 1 }}
						startIcon={<CreditScoreIcon />}
						variant="outlined"
						size="small"
						onClick={onPayDebts}
					>
						{t("payDebts.openBtn")}
					</Button>
				</Stack>
			)}

			{canSaveAdvance && (
				<FormControlLabel
					sx={{ mt: 1 }}
					control={
						<Switch
							size="small"
							checked={saveAsAdvance}
							onChange={(e) => onSaveAdvanceToggle(e.target.checked)}
						/>
					}
					label={
						<Stack direction="row" alignItems="center" spacing={0.5}>
							<Typography>{t("payment.saveAsAdvance")}</Typography>
						</Stack>
					}
				/>
			)}
		</Box>
	);
};

export default PaymentSummary;
