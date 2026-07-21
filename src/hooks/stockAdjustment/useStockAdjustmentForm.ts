import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	StockAdjustmentFormInputs,
	StockAdjustmentFormValues,
	StockAdjustmentSchema,
} from "schemas/StockAdjustmentSchema";

export interface UseStockAdjustmentFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	onSave: (payload: StockAdjustmentFormValues) => void;
}

export interface UseStockAdjustmentFormResult {
	form: UseFormReturn<StockAdjustmentFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

const DEFAULT_VALUES: StockAdjustmentFormInputs = {
	warehouseId: 0,
	productId: 0,
	direction: "Decrease",
	quantity: 0,
	reason: "",
	note: "",
};

export const useStockAdjustmentForm = ({
	isOpen,
	isSaving,
	onSave,
}: UseStockAdjustmentFormOptions): UseStockAdjustmentFormResult => {
	const form = useForm<StockAdjustmentFormInputs>({
		resolver: zodResolver(StockAdjustmentSchema),
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
