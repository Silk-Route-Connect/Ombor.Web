import { TransactionFormPayload } from "components/transaction/Form/TransactionForm";

import { useTransactionDetails } from "./DetailsState";
import { useTransactionPayments } from "./PaymentsState";

export type TransactionFormMode = "Sale" | "Supply";

export type TransactionFormType = ReturnType<typeof useCreateTransactionForm>;

export function useCreateTransactionForm(mode: TransactionFormMode) {
	const details = useTransactionDetails(mode);
	const payments = useTransactionPayments(mode, details.selectedPartner, details.totalDueLocal);

	const buildPayload = (): TransactionFormPayload => ({
		partnerId: details.selectedPartner?.id ?? 0,
		type: mode,
		lines: details.lines,
		notes: "",
		payments: payments.buildPaymentPayload(),
		debtPayments: payments.debtPayments,
	});

	return {
		mode,
		...details,
		...payments,
		formIsValid: payments.paymentIsValid && details.lines.length > 0 && !!details.selectedPartner,
		buildPayload,
	} as const;
}
