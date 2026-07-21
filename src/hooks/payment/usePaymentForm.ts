import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartnerType } from "models/partner";
import { PaymentDirection, PaymentType } from "models/payment";
import { PaymentFormInputs, PaymentSchema } from "schemas/PaymentSchema";

export interface UsePaymentFormOptions {
	isOpen: boolean;
}

export interface UsePaymentFormResult {
	form: UseFormReturn<PaymentFormInputs>;
}

const DEFAULT_VALUES: PaymentFormInputs = {
	type: "Transaction",
	direction: "Income",
	partnerId: null,
	employeeId: null,
	walletId: null,
	amount: 0,
	description: "",
	month: "Июнь",
	year: "2026",
};

/**
 * Auto-derive the payment direction (business-rules rule 14). Returns null when
 * the user must choose: General always, and a «Оба» partner on transaction /
 * deposit / withdrawal.
 */
export function autoDirection(
	type: PaymentType,
	partnerType: PartnerType | null,
): PaymentDirection | null {
	if (type === "Payroll") return "Expense";
	if (type === "General") return null;
	if (partnerType === "Both") return null;
	if (type === "Withdrawal") return "Expense";
	// Transaction / Deposit: Customer pays in (Income), we pay a Supplier (Expense).
	return partnerType === "Supplier" ? "Expense" : "Income";
}

export const usePaymentForm = ({ isOpen }: UsePaymentFormOptions): UsePaymentFormResult => {
	const form = useForm<PaymentFormInputs>({
		resolver: zodResolver(PaymentSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset } = form;

	useEffect(() => {
		if (isOpen) {
			reset({ ...DEFAULT_VALUES });
		}
	}, [isOpen, reset]);

	return { form };
};
