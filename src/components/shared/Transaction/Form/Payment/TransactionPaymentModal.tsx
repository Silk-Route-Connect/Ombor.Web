import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	MenuItem,
	TextField,
} from "@mui/material";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import NumericField from "components/shared/Inputs/NumericField";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { PaymentCurrency, PaymentMethod } from "models/payment";
import { TransactionRecord } from "models/transaction";

import TotalsBox from "../Steps/PaymentSummary";

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Card", "BankTransfer"];
const CURRENCIES: PaymentCurrency[] = ["UZS", "USD", "RUB"];
const CONTENT_HEIGHT = 560;

export interface ITransactionPaymentModalProps {
	isOpen: boolean;
	isSaving: boolean;
	transaction: TransactionRecord | null;

	onSave(payload: TransactionPaymentFormPayload): void;
	onCancel(): void;
}

export type TransactionPaymentFormPayload = {
	transactionId: number;
	amount: number;
	method: PaymentMethod;
	currency: PaymentCurrency;
	exchangeRate: number;
	notes?: string;
	attachments?: File[];
};

const TransactionPaymentModal: React.FC<ITransactionPaymentModalProps> = observer(
	({ isOpen, transaction, isSaving, onSave, onCancel }) => {
		const [amount, setAmount] = useState(0);
		const [method, setMethod] = useState<PaymentMethod>("Cash");
		const [currency, setCurrency] = useState<PaymentCurrency>("UZS");
		const [exchangeRate, setExchangeRate] = useState(1);
		const [notes, setNotes] = useState("");
		const [attachments, setAttachments] = useState<File[]>([]);

		useEffect(() => {
			if (isOpen) {
				resetForm();
			}
		}, [isOpen]);

		if (!transaction) {
			return null;
		}

		const resetForm = (): void => {
			setAmount(0);
			setMethod("Cash");
			setCurrency("UZS");
			setExchangeRate(1);
			setNotes("");
			setAttachments([]);
		};

		const handleSave = (): void => {
			onSave({
				transactionId: transaction.id,
				amount,
				method,
				currency,
				exchangeRate,
				notes,
				attachments,
			});
		};

		const totalPaidLocal = currency === "UZS" ? amount : amount * exchangeRate;
		const leftover = transaction.totalDue - (transaction.totalPaid + totalPaidLocal);
		const debtAmount = leftover > 0 ? leftover : 0;
		const advancePayment = totalPaidLocal - debtAmount;

		const summary = [
			{ label: translate("transaction.totalDue"), value: transaction.totalDue.toLocaleString() },
			{
				label: translate("transaction.paidPreviously"),
				value: transaction.totalPaid.toLocaleString(),
			},
			{
				label: translate("transaction.toBePaid"),
				value: totalPaidLocal.toLocaleString(),
			},
			{
				label: translate("transaction.leftover"),
				value: leftover.toLocaleString(),
			},
			advancePayment > 0 && {
				label: translate("transaction.advancePayment"),
				value: advancePayment.toLocaleString(),
			},
		].filter(Boolean) as { label: string; value: string | number }[];

		return (
			<Dialog open={isOpen} onClose={() => !isSaving && onCancel()} fullWidth maxWidth="md">
				<DialogTitle sx={{ pr: 6 }}>
					{translate("transaction.addPaymentTitle")}
					<IconButton onClick={onCancel} sx={{ position: "absolute", right: 8, top: 8 }}>
						<CloseIcon />
					</IconButton>
				</DialogTitle>
				<DialogContent dividers sx={{ height: CONTENT_HEIGHT }}>
					<Grid container rowSpacing={3} columnSpacing={2}>
						<Grid size={{ xs: 12, sm: 3 }}>
							<NumericField
								label={translate("transaction.totalPaid")}
								value={amount}
								onChange={(e) => {
									const value = Number(e.target.value);

									if (value < 0) {
										return;
									}
									setAmount(value);
								}}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 3 }}>
							<TextField
								select
								label={translate("payment.method")}
								value={method}
								onChange={(e) => setMethod(e.target.value as PaymentMethod)}
								fullWidth
							>
								{PAYMENT_METHODS.map((m) => (
									<MenuItem key={m} value={m}>
										{translate(`payment.method.${m}`)}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid size={{ xs: 12, sm: 3 }}>
							<TextField
								select
								label={translate("fieldCurrency")}
								value={currency}
								onChange={(e) => setCurrency(e.target.value as PaymentCurrency)}
								fullWidth
							>
								{CURRENCIES.map((c) => (
									<MenuItem key={c} value={c}>
										{c}
									</MenuItem>
								))}
							</TextField>
						</Grid>

						<Grid size={{ xs: 12, sm: 3 }}>
							<NumericField
								label={translate("fieldExchangeRate")}
								value={exchangeRate}
								onChange={(e) => {
									const value = Number(e.target.value);

									if (value < 0) {
										return;
									}

									setExchangeRate(value);
								}}
								disabled={currency === "UZS"}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<TextField
								label={translate("fieldNotes")}
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								fullWidth
								multiline
								minRows={3}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<AttachmentPicker
								files={attachments}
								label={translate("fieldAttachments")}
								onAdd={(files) => setAttachments((prev) => [...prev, ...Array.from(files)])}
								onRemove={(index) =>
									setAttachments((prev) => [...prev.filter((_, i) => i !== index)])
								}
							/>
						</Grid>

						<Grid size={{ xs: 12 }}>
							<TotalsBox rows={summary} />
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions
					sx={{
						justifyContent: "flex-end",
					}}
				>
					<Button onClick={onCancel}>{translate("close")}</Button>
					<Button variant="contained" onClick={handleSave} disabled={isSaving}>
						{translate("save")}
					</Button>
				</DialogActions>
			</Dialog>
		);
	},
);

export default TransactionPaymentModal;
