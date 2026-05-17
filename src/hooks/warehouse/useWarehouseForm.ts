import { useEffect } from "react";
import { useForm, UseFormReturn, UseFormStateReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse } from "models/warehouse";
import { WarehouseFormInputs, WarehouseFormValues, WarehouseSchema } from "schemas/WarehouseSchema";

export type WarehouseFormPayload = WarehouseFormValues;

export interface UseWarehouseFormResult {
	form: UseFormReturn<WarehouseFormInputs>;
	formState: UseFormStateReturn<WarehouseFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: WarehouseFormInputs = {
	name: "",
	location: null,
	isActive: true,
};

export const useWarehouseForm = ({
	isOpen,
	isSaving,
	warehouse,
	onSave,
}: {
	isOpen: boolean;
	isSaving: boolean;
	warehouse?: Warehouse | null;
	onSave: (payload: WarehouseFormPayload) => void;
}): UseWarehouseFormResult => {
	const form = useForm<WarehouseFormInputs>({
		resolver: zodResolver(WarehouseSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { formState } = form;

	useEffect(() => {
		const initialValues = warehouse
			? {
					name: warehouse.name,
					location: warehouse.location,
					isActive: warehouse.isActive,
				}
			: DEFAULT_VALUES;
		form.reset(initialValues);
	}, [isOpen, warehouse, form]);

	const submit = form.handleSubmit(onSave);

	const canSave = formState.isValid && formState.isDirty && !isSaving;

	return {
		form,
		formState,
		canSave,
		submit,
	};
};
