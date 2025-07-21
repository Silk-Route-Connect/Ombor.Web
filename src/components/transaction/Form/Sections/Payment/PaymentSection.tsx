import React, { useEffect, useState } from "react";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaymentIcon from "@mui/icons-material/Payment";
import SaveIcon from "@mui/icons-material/Save";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Divider,
	FormControlLabel,
	Stack,
	Switch,
	Typography,
} from "@mui/material";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { formatNumberWithCommas } from "utils/formatCurrency";

import PayDebtsModal from "../../DebtPayment/DebtsPaymentModal";
import NotesSection from "../Details/NotesSection";
import PaymentRow from "./PaymentRow";

interface Props {
	form: TransactionFormType;
	onSave: () => void;
}

const PaymentSection: React.FC<Props> = observer(({ form, onSave }) => {
	const { selectedPartnerStore } = useStore();
	const partner = form.selectedPartner;
	const partnerBalanceBefore = partner?.balance ?? 0;

	const {
		totalDue,
		remainingAdvance,
		debtAmount,
		changeAmount,
		allocatedTotal,
		advanceAmount,
		accountWithdrawal /* NEW */,
		hasAccountBalance /* NEW */,
	} = form;

	const [keepAsAdvance, setKeepAsAdvance] = useState(false);
	const [showModal, setShowModal] = useState(false);

	const openDebts =
		selectedPartnerStore.openTransactions !== "loading"
			? selectedPartnerStore.openTransactions
			: [];

	const totalOpenDebt = React.useMemo(
		() => openDebts.reduce((sum, d) => sum + Math.max(d.totalDue - d.totalPaid, 0), 0),
		[openDebts],
	);

	const debtLeftAfterAllocation = Math.max(totalOpenDebt - allocatedTotal, 0);
	const overPayment = advanceAmount > 0;
	const canOpenDebtModal = partner && overPayment && totalDue > 0 && partner.balance < 0;

	const showAdvanceSwitch =
		partner &&
		remainingAdvance > 0 &&
		debtAmount === 0 &&
		debtLeftAfterAllocation === 0 &&
		!hasAccountBalance;

	console.log(partner, !!partner);
	console.log(remainingAdvance, remainingAdvance > 0);
	console.log(debtAmount, debtAmount === 0);
	console.log(debtLeftAfterAllocation, debtLeftAfterAllocation === 0);
	console.log(hasAccountBalance, !hasAccountBalance);
	console.log(showAdvanceSwitch);

	const showPaidDebtRow = allocatedTotal > 0;

	/* ------------------------------------------------------------------ */
	/*  Balance after the transaction                                     */
	/* ------------------------------------------------------------------ */
	const effectivePaid = form.totalPaidLocal; // cash + credit
	const unpaidAmount = Math.max(totalDue - effectivePaid, 0);
	const overpayment = Math.max(effectivePaid - totalDue - allocatedTotal, 0);
	const balanceAfter =
		partnerBalanceBefore -
		// new debt or credit created by the document itself
		(form.mode === "Sale" ? unpaidAmount : -unpaidAmount) +
		// cash we give / get today
		(form.mode === "Supply" ? effectivePaid : -effectivePaid) -
		// credit consumed from balance
		accountWithdrawal +
		// optional new advance
		(keepAsAdvance ? overpayment : 0);

	useEffect(() => {
		if (!showAdvanceSwitch && keepAsAdvance) setKeepAsAdvance(false);
	}, [showAdvanceSwitch, keepAsAdvance]);

	return (
		<Stack spacing={2} sx={{ height: "100%" }}>
			<Stack direction="row" justifyContent="space-between" mb={1}>
				<Typography variant="h6" color="text.secondary">
					{translate("payment.partnerBalanceBefore")}
				</Typography>
				<Typography variant="h5" color={partnerBalanceBefore < 0 ? "error.main" : "success.main"}>
					{formatNumberWithCommas(partnerBalanceBefore)}
				</Typography>
			</Stack>

			<Divider />

			<Box
				sx={{
					flexGrow: 1,
					minHeight: 0,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
					gap: 2,
					pt: 1,
				}}
			>
				<Stack spacing={1}>
					{form.payments.map((p) => (
						<PaymentRow
							key={p.id}
							isRemovable={form.payments.length > 1}
							row={p}
							maxAmount={p.method === "AccountBalance" ? partnerBalanceBefore : undefined}
							onUpdate={form.updatePayment}
							onRemove={form.removePayment}
						/>
					))}
				</Stack>

				<Button variant="outlined" startIcon={<PaymentIcon />} onClick={form.addPayment}>
					{translate("payment.addPayment")}
				</Button>

				{/* ---------- totals & helpers ---------- */}
				<Box border={1} borderColor="divider" borderRadius={2} p={2} bgcolor="background.paper">
					<Stack direction="row" justifyContent="space-between" mb={1}>
						<Typography>{translate("transaction.totalDue")}</Typography>
						<Typography fontWeight={600}>{totalDue.toLocaleString()}</Typography>
					</Stack>

					<Stack direction="row" justifyContent="space-between" mb={1}>
						<Typography>{translate("transaction.totalPaid")}</Typography>
						<Typography fontWeight={600}>{form.totalPaidLocal.toLocaleString()}</Typography>
					</Stack>

					{showPaidDebtRow && partner && (
						<Stack direction="row" justifyContent="space-between" mb={1}>
							<Typography>{translate("payDebts.paidDebt")}</Typography>
							<Typography fontWeight={600}>{allocatedTotal.toLocaleString()}</Typography>
						</Stack>
					)}

					<Stack direction="row" justifyContent="space-between" mb={1}>
						<Typography>
							{keepAsAdvance
								? translate("payment.advancePayment")
								: translate("transaction.changeAmount")}
						</Typography>
						<Typography fontWeight={600}>{changeAmount.toLocaleString()}</Typography>
					</Stack>

					{debtAmount > 0 && !!partner && (
						<Stack direction="row" justifyContent="space-between" mb={1}>
							<Typography>{translate("transaction.debtAmount")}</Typography>
							<Typography fontWeight={600} color="error.main">
								{formatNumberWithCommas(debtAmount)}
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

					{showAdvanceSwitch && (
						<FormControlLabel
							sx={{ mt: 1 }}
							control={
								<Switch
									size="small"
									checked={keepAsAdvance}
									onChange={(e) => setKeepAsAdvance(e.target.checked)}
								/>
							}
							label={
								<Stack direction="row" alignItems="center" spacing={0.5}>
									<Typography>{translate("payment.saveAsAdvance")}</Typography>
								</Stack>
							}
						/>
					)}

					{canOpenDebtModal && (
						<Stack>
							<Button
								sx={{ mt: 1 }}
								startIcon={<CreditScoreIcon />}
								variant="outlined"
								size="small"
								onClick={() => setShowModal(true)}
							>
								{translate("payDebts.openBtn")}
							</Button>
						</Stack>
					)}
				</Box>
			</Box>

			<Accordion defaultExpanded={!!form.notes}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>{translate("fieldNotes")}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<NotesSection form={form} />
				</AccordionDetails>
			</Accordion>

			<Button
				variant="contained"
				startIcon={<SaveIcon />}
				disabled={!form.isValid}
				onClick={onSave}
			>
				{translate("save")}
			</Button>

			<PayDebtsModal
				open={showModal}
				onClose={() => setShowModal(false)}
				availableAmount={remainingAdvance + allocatedTotal}
				initialAllocations={form.debtAllocations}
				onApply={(allocations) => {
					form.setDebtAllocations(allocations);
					setShowModal(false);
				}}
			/>
		</Stack>
	);
});

export default PaymentSection;
