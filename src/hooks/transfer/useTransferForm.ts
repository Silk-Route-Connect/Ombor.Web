import { useEffect } from "react";
import { useFieldArray, UseFieldArrayReturn, useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransferFormInputs, TransferFormValues, TransferSchema } from "schemas/TransferSchema";

export interface UseTransferFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	onSave: (payload: TransferFormValues) => void;
}

export interface UseTransferFormResult {
	form: UseFormReturn<TransferFormInputs>;
	lines: UseFieldArrayReturn<TransferFormInputs, "lines", "key">;
	canSave: boolean;
	submit: () => Promise<void>;
}

const emptyLine = (): TransferFormInputs["lines"][number] => ({ productId: 0, quantity: 0 });

const DEFAULT_VALUES: TransferFormInputs = {
	fromWarehouseId: 0,
	toWarehouseId: 0,
	note: "",
	lines: [emptyLine()],
};

export const useTransferForm = ({
	isOpen,
	isSaving,
	onSave,
}: UseTransferFormOptions): UseTransferFormResult => {
	const form = useForm<TransferFormInputs>({
		resolver: zodResolver(TransferSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: DEFAULT_VALUES,
	});

	const { reset, handleSubmit, control } = form;
	// `key` avoids clashing with the line's own `id`-less shape; RHF needs a stable id.
	const lines = useFieldArray({ control, name: "lines", keyName: "key" });

	useEffect(() => {
		reset({ ...DEFAULT_VALUES, lines: [emptyLine()] });
	}, [isOpen, reset]);

	return {
		form,
		lines,
		canSave: !isSaving,
		submit: handleSubmit(onSave),
	};
};

export { emptyLine };
