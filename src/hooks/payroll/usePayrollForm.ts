import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Employee } from "models/employee";
import { Payment } from "models/payment";
import { PayrollFormInputs, PayrollFormValues, PayrollSchema } from "schemas/PayrollSchema";
import { mapPaymentToFormValues, PAYROLL_FORM_DEFAULT_VALUES } from "utils/payrollUtils";

export type PayrollFormPayload = PayrollFormValues;

interface UsePayrollFormParams {
	isOpen: boolean;
	isSaving: boolean;
	payment?: Payment | null;
	employee?: Employee | null;
	onSave: (payload: PayrollFormPayload) => Promise<void>;
	onClose: () => void;
}

interface UsePayrollFormResult {
	form: UseFormReturn<PayrollFormInputs>;
	canSave: boolean;
	discardOpen: boolean;

	selectedEmployee: Employee | null;
	setSelectedEmployee: (employee: Employee | null) => void;

	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

export function usePayrollForm({
	isOpen,
	isSaving,
	payment,
	employee,
	onSave,
	onClose,
}: UsePayrollFormParams): UsePayrollFormResult {
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const form = useForm<PayrollFormInputs>({
		resolver: zodResolver(PayrollSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: PAYROLL_FORM_DEFAULT_VALUES,
	});

	const { setValue } = form;

	useEffect(() => {
		const formValues = payment
			? mapPaymentToFormValues(payment)
			: { ...PAYROLL_FORM_DEFAULT_VALUES, employeeId: employee?.id || 0 };

		form.reset(formValues);
		setSelectedEmployee(null);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen, payment, employee]);

	const currentEmployee = useMemo(() => {
		if (payment?.employeeId) {
			return {
				id: payment.employeeId,
				name: payment.employeeName || "",
				position: "",
			} as Employee;
		}

		return employee ?? selectedEmployee;
	}, [payment, employee, selectedEmployee]);

	const handleEmployeeChange = useCallback(
		(emp: Employee | null) => {
			setSelectedEmployee(emp);
			setValue("employeeId", emp?.id || 0, { shouldDirty: true, shouldValidate: true });
		},
		[setValue],
	);

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

	const canSave = isValid && !isSaving && (payment ? isDirty : true);

	return {
		form,
		canSave,
		discardOpen,

		selectedEmployee: currentEmployee,
		setSelectedEmployee: handleEmployeeChange,

		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
