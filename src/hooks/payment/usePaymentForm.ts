import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PartnerType } from "models/partner";
import { PaymentDirection, PaymentType } from "models/payment";
import { PaymentFormInputs, PaymentSchema } from "schemas/PaymentSchema";

export interface UsePaymentFormOptions {
	isOpen: boolean;
	/** Active wallets from the form data — the first one is preselected. */
	wallets: { id: number }[];
}

export interface UsePaymentFormResult {
	form: UseFormReturn<PaymentFormInputs>;
}

/** Built per open so the payroll period always defaults to the current month. */
const defaultValues = (): PaymentFormInputs => {
	const now = new Date();
	return {
		type: "Transaction",
		direction: "Income",
		partnerId: null,
		employeeId: null,
		walletId: null,
		amount: 0,
		description: "",
		month: now.getMonth() + 1,
		year: now.getFullYear(),
	};
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

export const usePaymentForm = ({
	isOpen,
	wallets,
}: UsePaymentFormOptions): UsePaymentFormResult => {
	const form = useForm<PaymentFormInputs>({
		resolver: zodResolver(PaymentSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: defaultValues(),
	});

	const { reset, getValues, setValue } = form;
	const firstWalletId = wallets[0]?.id ?? null;

	useEffect(() => {
		if (isOpen) {
			reset(defaultValues());
		}
	}, [isOpen, reset]);

	// Preselect the paying wallet (the only one, or the first active) once the
	// reference data is in — not dirtying the form, so closing needs no confirm.
	useEffect(() => {
		if (isOpen && firstWalletId != null && getValues("walletId") == null) {
			setValue("walletId", firstWalletId);
		}
	}, [isOpen, firstWalletId, getValues, setValue]);

	return { form };
};
