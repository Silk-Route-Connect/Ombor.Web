import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { ContactInfo, Employee } from "models/employee";
import { EmployeeFormInputs, EmployeeFormValues, EmployeeSchema } from "schemas/EmployeeSchema";
import {
	cleanContactInfo,
	EMPLOYEE_FORM_DEFAULT_VALUES,
	mapEmployeeToFormValues,
} from "utils/employeeUtils";

export type EmployeeFormPayload = Omit<EmployeeFormValues, "contactInfo"> & {
	contactInfo?: ContactInfo;
};

interface UseEmployeeFormParams {
	isOpen: boolean;
	isSaving: boolean;
	employee?: Employee | null;
	onSave: (payload: EmployeeFormPayload) => void;
	onClose: () => void;
}

interface UseEmployeeFormResult {
	form: UseFormReturn<EmployeeFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

export function useEmployeeForm({
	isOpen,
	isSaving,
	employee,
	onSave,
	onClose,
}: UseEmployeeFormParams): UseEmployeeFormResult {
	const form = useForm<EmployeeFormInputs>({
		resolver: zodResolver(EmployeeSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: EMPLOYEE_FORM_DEFAULT_VALUES,
	});

	useEffect(() => {
		form.reset(employee ? mapEmployeeToFormValues(employee) : { ...EMPLOYEE_FORM_DEFAULT_VALUES });
	}, [employee, isOpen, form]);

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
		const cleaned = cleanContactInfo(data);
		onSave(cleaned);
	});

	const canSave = isValid && !isSaving && (employee ? isDirty : true);

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
