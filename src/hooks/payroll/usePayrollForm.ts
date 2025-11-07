import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Payment } from "models/payment";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { mapPaymentToFormValues, PAYROLL_FORM_DEFAULT_VALUES } from "utils/payrollUtils";

export type PayrollFormPayload = PayrollFormValues;

interface UsePayrollFormParams {
	isOpen: boolean;
	isSaving: boolean;
	payment?: Payment | null;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
	onClose: () => void;
}

interface UsePayrollFormResult {
	form: UseFormReturn<PayrollFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

export function usePayrollForm({
	isOpen,
	isSaving,
	payment,
	onSave,
	onClose,
}: UsePayrollFormParams): UsePayrollFormResult {
	const form = useForm<PayrollFormInputs>({
		resolver: zodResolver(PayrollSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: PAYROLL_FORM_DEFAULT_VALUES,
	});

	useEffect(() => {
		const formValues = payment
			? mapPaymentToFormValues(payment)
			: { ...PAYROLL_FORM_DEFAULT_VALUES };
		form.reset(formValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, payment]);

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		isDirty,
		isSaving,
		onClose,
	);

	const submit = handleSubmit(async (data) => {
		await onSave(data);
	});

	const canSave = isValid && !isSaving && (payment ? isDirty : true);

	return {
		form,
		canSave,
		discardOpen,
		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
