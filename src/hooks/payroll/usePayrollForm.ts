import { useEffect, useMemo } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { useStore } from "stores/StoreContext";
import { mapPaymentToFormValues, PAYROLL_FORM_DEFAULT_VALUES } from "utils/payrollUtils";

export type PayrollFormPayload = PayrollFormValues;

export type PayrollFormMode = Payment | Employee | null;

interface UsePayrollFormParams {
	isOpen: boolean;
	isSaving: boolean;
	mode: PayrollFormMode;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
	onClose: () => void;
}

interface UsePayrollFormResult {
	form: UseFormReturn<PayrollFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	isEditMode: boolean;
	isEmployeeLocked: boolean;

	selectedEmployee: Employee | null;
	setEmployeeId: (employeeId: number) => void;

	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

const isPayment = (mode: PayrollFormMode): mode is Payment => {
	return mode !== null && "employeeId" in mode && "amount" in mode;
};

const isEmployee = (mode: PayrollFormMode): mode is Employee => {
	return mode !== null && "name" in mode && "position" in mode;
};

export function usePayrollForm({
	isOpen,
	isSaving,
	mode,
	onSave,
	onClose,
}: UsePayrollFormParams): UsePayrollFormResult {
	const { employeeStore } = useStore();

	const form = useForm<PayrollFormInputs>({
		resolver: zodResolver(PayrollSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: PAYROLL_FORM_DEFAULT_VALUES,
	});

	const { control, setValue, reset } = form;
	const employeeId = useWatch({ control, name: "employeeId" });

	const isEditMode = isPayment(mode);
	const isEmployeeLocked = isPayment(mode) || isEmployee(mode);

	useEffect(() => {
		let formValues: PayrollFormValues;

		if (isPayment(mode)) {
			formValues = mapPaymentToFormValues(mode);
		} else if (isEmployee(mode)) {
			formValues = { ...PAYROLL_FORM_DEFAULT_VALUES, employeeId: mode.id };
		} else {
			formValues = PAYROLL_FORM_DEFAULT_VALUES;
		}

		reset(formValues);
	}, [isOpen, mode, reset]);

	const selectedEmployee = useMemo(() => {
		if (employeeStore.allEmployees === "loading") {
			return null;
		}

		return employeeStore.allEmployees.find((e) => e.id === employeeId) ?? null;
	}, [employeeStore.allEmployees, employeeId]);

	const setEmployeeId = (id: number) => {
		setValue("employeeId", id, { shouldDirty: true, shouldValidate: true });
	};

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		isDirty,
		isSaving,
		onClose,
	);

	const submit = handleSubmit(onSave);

	const canSave = isValid && !isSaving && (isEditMode ? isDirty : true);

	return {
		form,
		canSave,
		discardOpen,
		isEditMode,
		isEmployeeLocked,

		selectedEmployee,
		setEmployeeId,

		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
