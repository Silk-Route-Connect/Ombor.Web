import { useEffect } from "react";
import { useFieldArray, UseFieldArrayReturn, useForm, UseFormReturn } from "react-hook-form";
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
	lines: UseFieldArrayReturn<OpeningStockFormInputs, "items", "key">;
	canSave: boolean;
	submit: () => Promise<void>;
}

const emptyLine = (): OpeningStockFormInputs["items"][number] => ({
	productId: 0,
	quantity: 0,
	unitCost: 0,
});

const DEFAULT_VALUES: OpeningStockFormInputs = {
	items: [emptyLine()],
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

	const { reset, handleSubmit, control } = form;
	// `key` keeps RHF's field id off the line's own shape.
	const lines = useFieldArray({ control, name: "items", keyName: "key" });

	useEffect(() => {
		reset({ ...DEFAULT_VALUES, items: [emptyLine()] });
	}, [isOpen, reset]);

	return {
		form,
		lines,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};

export { emptyLine };
