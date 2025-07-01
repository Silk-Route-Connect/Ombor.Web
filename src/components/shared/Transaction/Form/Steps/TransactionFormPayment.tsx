import React from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import AttachmentPicker from "components/shared/AttachmentPicker/AttachmentPicker";
import NumericField from "components/shared/Inputs/NumericField";
import { TransactionFormState } from "hooks/transactions/useTransactionForm";
import { translate } from "i18n/i18n";
import { PaymentCurrency, PaymentMethod } from "models/payment";

import TotalsBox from "./PaymentSummary";

const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "Card", "BankTransfer"];
const CURRENCIES: PaymentCurrency[] = ["UZS", "USD", "RUB"];

interface TransactionFormPaymentProps {
	form: TransactionFormState;
}

const TransactionFormPayment: React.FC<TransactionFormPaymentProps> = ({ form }) => {
	const summary = [
		{ label: translate("transaction.totalDue"), value: form.totalDue.toLocaleString() },
		{ label: translate("transaction.discount"), value: form.totalDiscount.toLocaleString() },
		{
			label: translate("transaction.totalPaid"),
			value: form.totalPaidLocal.toLocaleString(),
		},
		{
			label: translate("transaction.debtAmount"),
			value: form.debtAmount.toLocaleString(),
		},
		{
			label: translate("transaction.advancePayment"),
			value: form.advanceAmount.toLocaleString(),
		},
	].filter(Boolean) as { label: string; value: string | number }[];

	return (
		<Grid container rowSpacing={3} columnSpacing={2}>
			<Grid size={{ xs: 12, sm: 3 }}>
				<NumericField
					label={translate("transaction.totalPaid")}
					value={form.totalPaid}
					onChange={(e) => {
						const value = Number(e.target.value);

						if (value < 0) {
							return;
						}
						form.setTotalPaid(value);
					}}
				/>
			</Grid>

			<Grid size={{ xs: 12, sm: 3 }}>
				<TextField
					select
					label={translate("payment.method")}
					value={form.paymentMethod}
					onChange={(e) => form.setPaymentMethod(e.target.value as PaymentMethod)}
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
					value={form.currency}
					onChange={(e) => form.setCurrency(e.target.value as PaymentCurrency)}
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
					value={form.exchangeRate}
					onChange={(e) => {
						const value = Number(e.target.value);

						if (value < 0) {
							return;
						}

						form.setExchangeRate(value);
					}}
					disabled={form.currency === "UZS"}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TextField
					label={translate("fieldNotes")}
					value={form.notes}
					onChange={(e) => form.setNotes(e.target.value)}
					fullWidth
					multiline
					minRows={3}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<AttachmentPicker
					files={form.attachments}
					label={translate("fieldAttachments")}
					onAdd={form.addAttachments}
					onRemove={form.removeAttachment}
				/>
			</Grid>

			<Grid size={{ xs: 12 }}>
				<TotalsBox rows={summary} />
			</Grid>
		</Grid>
	);
};

export default TransactionFormPayment;
