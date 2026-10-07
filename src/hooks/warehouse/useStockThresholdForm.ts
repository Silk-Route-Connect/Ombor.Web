import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarehouseStockItem } from "models/warehouse";
import { StockThresholdFormInputs, StockThresholdSchema } from "schemas/WarehouseSchema";

export interface UseStockThresholdFormOptions {
	/** The row being edited; null while the dialog is closed. */
	row: WarehouseStockItem | null;
	isSaving: boolean;
	/** The new threshold, or null to stop tracking the row. */
	onSave: (value: number | null) => void;
}

export interface UseStockThresholdFormResult {
	form: UseFormReturn<StockThresholdFormInputs>;
	canSave: boolean;
	submit: () => Promise<void>;
}

/** The «Порог» dialog of a warehouse stock row (DR-41): one optional threshold. */
export const useStockThresholdForm = ({
	row,
	isSaving,
	onSave,
}: UseStockThresholdFormOptions): UseStockThresholdFormResult => {
	const form = useForm<StockThresholdFormInputs>({
		resolver: zodResolver(StockThresholdSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: { lowStockThreshold: null },
	});

	const { reset, handleSubmit } = form;

	// Reset on open only: the closing dialog keeps its last values while it fades out.
	useEffect(() => {
		if (row) {
			reset({ lowStockThreshold: row.lowStockThreshold ?? null });
		}
	}, [row, reset]);

	return {
		form,
		canSave: !isSaving,
		submit: handleSubmit((values) => onSave(values.lowStockThreshold ?? null)),
	};
};
