import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import AddPaymentButton from "components/shared/Buttons/AddPaymentButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { TransactionFormType } from "hooks/transactions/useCreateTransactionForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";

import PayDebtsModal from "../../DebtPayment/DebtsPaymentModal";
import NotesSection from "../Details/NotesSection";
import { PAYMENT_CONTENT_SX } from "./PaymentConfigs";
import PaymentHeader from "./PaymentHeader";
import PaymentRow from "./PaymentRow";
import PaymentSummary from "./PaymentSummary";

interface PaymentSectionProps {
	form: TransactionFormType;
	onSave: () => void;
}

const PaymentSection: React.FC<PaymentSectionProps> = observer(({ form, onSave }) => {
	const [showModal, setShowModal] = useState(false);

	const partner = form.selectedPartner;
	const partnerBalanceBefore = partner?.balance ?? 0;
	const debtAmount =
		form.mode === "Sale"
			? (partner?.balanceDto?.payableDebt ?? 0)
			: (partner?.balanceDto?.receivableDebt ?? 0);
	const {
		totalDueLocal,
		totalPaid,
		overpaid,
		underpaid,
		debtPaid,
		hasAccountBalanceRow,
		refundChange,
		effectiveOverpaid,
		balanceAfter,
		setRefundChange,
	} = form;

	const debtLeftAfterAllocation = Math.max(debtAmount - debtPaid, 0);
	const hasDebt = debtAmount > 0;
	const canOpenDebtModal = !!partner && overpaid > 0 && totalDueLocal > 0 && !!hasDebt;

	const [saveAsAdvance, setSaveAsAdvance] = useState(!refundChange);
	const handleAdvanceToggle = (checked: boolean) => {
		setSaveAsAdvance(checked);
		setRefundChange(!checked);
	};

	const canSaveAdvance =
		!!partner &&
		overpaid - debtPaid > 0 &&
		underpaid === 0 &&
		debtLeftAfterAllocation === 0 &&
		!hasAccountBalanceRow;

	return (
		<Stack spacing={2} sx={{ height: "100%" }}>
			<PaymentHeader
				balance={partner?.balanceDto ?? null}
				mustUseAccountBalance={form.mustUseAccountBalance}
			/>

			<Divider />

			<Box sx={PAYMENT_CONTENT_SX}>
				<Stack spacing={1}>
					{form.payments.map((payment) => (
						<PaymentRow
							key={payment.id}
							isRemovable={form.payments.length > 1}
							row={payment}
							maxAmount={payment.method === "AccountBalance" ? partnerBalanceBefore : undefined}
							onUpdate={form.updatePayment}
							onRemove={form.removePayment}
						/>
					))}
				</Stack>

				<AddPaymentButton onAddPayment={form.addPayment} disabled={totalPaid === 0} />

				<PaymentSummary
					totalDue={totalDueLocal}
					totalPaid={totalPaid}
					overpaid={overpaid}
					underpaid={underpaid}
					effectiveOverpaid={effectiveOverpaid}
					debtPaid={debtPaid}
					balanceAfter={balanceAfter}
					refundChange={refundChange}
					canPayDebts={canOpenDebtModal}
					canSaveAdvance={canSaveAdvance}
					saveAsAdvance={saveAsAdvance}
					onPayDebts={() => setShowModal(true)}
					onSaveAdvanceToggle={handleAdvanceToggle}
				/>
			</Box>

			<Accordion defaultExpanded={!!form.notes}>
				<AccordionSummary expandIcon={<ExpandMoreIcon />}>
					<Typography>{translate("fieldNotes")}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<NotesSection form={form} />
				</AccordionDetails>
			</Accordion>

			<SaveButton onSave={onSave} disabled={!form.paymentIsValid} />

			<PayDebtsModal
				open={showModal}
				onClose={() => setShowModal(false)}
				availableAmount={overpaid + debtPaid}
				initialAllocations={form.debtPayments}
				onApply={(allocations) => {
					form.setDebtPayments(allocations);
					setShowModal(false);
				}}
			/>
		</Stack>
	);
});

export default PaymentSection;
