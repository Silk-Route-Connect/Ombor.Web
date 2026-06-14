import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	OpeningStockFormInputs,
	OpeningStockFormValues,
	OpeningStockSchema,
} from "schemas/WarehouseSchema";

export interface UseOpeningStockFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	onSave: (payload: OpeningStockFormValues) => void;
}

export interface UseOpeningStockFormResult {
	form: UseFormReturn<OpeningStockFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: OpeningStockFormInputs = {
	productId: 0,
	quantity: 0,
	unitCost: 0,
	note: "",
};

export const useOpeningStockForm = ({
	isOpen,
	isSaving,
	onSave,
}: UseOpeningStockFormOptions): UseOpeningStockFormResult => {
	const form = useForm<OpeningStockFormInputs>({
		resolver: zodResolver(OpeningStockSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset, handleSubmit } = form;

	useEffect(() => {
		reset({ ...DEFAULT_VALUES });
	}, [isOpen, reset]);

	return {
		form,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};
