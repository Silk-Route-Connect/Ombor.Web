import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { PAYROLL_FORM_DEFAULT_VALUES } from "utils/payrollUtils";

export type PayrollFormPayload = PayrollFormValues;

interface UsePayrollFormParams {
	isOpen: boolean;
	isSaving: boolean;
	onSave: (payload: PayrollFormPayload) => void;
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
		form.reset({ ...PAYROLL_FORM_DEFAULT_VALUES });
	}, [isOpen, form]);

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		isDirty,
		isSaving,
		onClose,
	);

	const submit = handleSubmit((data) => {
		onSave(data);
	});

	const canSave = isValid && !isSaving;

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
