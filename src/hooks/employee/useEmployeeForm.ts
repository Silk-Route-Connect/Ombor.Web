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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const {
		handleSubmit,
		formState: { isDirty },
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

	// Save stays enabled (hard rule 5): validation runs on submit (handleSubmit
	// blocks an invalid form and surfaces inline errors); the button is only inert
	// while a save is in flight.
	const canSave = !isSaving;

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
