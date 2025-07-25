import React from "react";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import { Box, Button, Divider, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { translate } from "i18n/i18n";
import { formatNumberWithCommas } from "utils/formatCurrency";

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
}) => (
	<Box border={1} borderColor="divider" borderRadius={2} p={2} bgcolor="background.paper">
		<Stack direction="row" justifyContent="space-between" mb={1}>
			<Typography>{translate("transaction.totalDue")}</Typography>
			<Typography fontWeight={600}>{totalDue.toLocaleString()}</Typography>
		</Stack>

		<Stack direction="row" justifyContent="space-between" mb={1}>
			<Typography>{translate("transaction.totalPaid")}</Typography>
			<Typography fontWeight={600}>{totalPaid.toLocaleString()}</Typography>
		</Stack>

		{debtPaid > 0 && (
			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography>{translate("payDebts.paidDebt")}</Typography>
				<Typography fontWeight={600}>{debtPaid.toLocaleString()}</Typography>
			</Stack>
		)}

		{overpaid > 0 && (
			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography>
					{refundChange
						? translate("transaction.changeAmount")
						: translate("payment.advancePayment")}
				</Typography>
				<Typography fontWeight={600}>{effectiveOverpaid.toLocaleString()}</Typography>
			</Stack>
		)}

		{underpaid >= 0 && (
			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography>{translate("transaction.debtAmount")}</Typography>
				<Typography fontWeight={600} color={underpaid > 0 ? "error.main" : "textPrimary"}>
					{underpaid.toLocaleString()}
				</Typography>
			</Stack>
		)}

		<Divider sx={{ my: 1 }} />

		<Stack direction="row" justifyContent="space-between">
			<Typography>{translate("payment.partnerBalanceAfter")}</Typography>
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
					{translate("payDebts.openBtn")}
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
						<Typography>{translate("payment.saveAsAdvance")}</Typography>
					</Stack>
				}
			/>
		)}
	</Box>
);

export default PaymentSummary;
