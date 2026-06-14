import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse } from "models/warehouse";
import { WarehouseFormInputs, WarehouseFormValues, WarehouseSchema } from "schemas/WarehouseSchema";

export interface UseWarehouseFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	warehouse?: Warehouse | null;
	onSave: (payload: WarehouseFormValues) => void;
}

export interface UseWarehouseFormResult {
	form: UseFormReturn<WarehouseFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: WarehouseFormInputs = {
	name: "",
	location: "",
};

export const useWarehouseForm = ({
	isOpen,
	isSaving,
	warehouse,
	onSave,
}: UseWarehouseFormOptions): UseWarehouseFormResult => {
	const form = useForm<WarehouseFormInputs>({
		resolver: zodResolver(WarehouseSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset, handleSubmit } = form;

	useEffect(() => {
		reset(
			warehouse
				? { name: warehouse.name, location: warehouse.location ?? "" }
				: { ...DEFAULT_VALUES },
		);
	}, [isOpen, warehouse, reset]);

	// Save stays enabled (hard rule 5): validation runs on submit and reports
	// inline; the button is only inert while a save is in flight.
	return {
		form,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};
