import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "models/category";
import { CategoryFormInputs, CategoryFormValues, CategorySchema } from "schemas/CategorySchema";
import { emptyCategoryFormDefaults, mapCategoryToFormPayload } from "utils/categoryUtils";

export type CategoryFormPayload = CategoryFormValues;

export interface UseCategoryFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	category: Category | null;
	onSave: (payload: CategoryFormPayload) => void;
	onClose: () => void;
}

export interface UseCategoryFormResult {
	form: UseFormReturn<CategoryFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

export function useCategoryForm({
	isOpen,
	isSaving,
	category,
	onSave,
	onClose,
}: UseCategoryFormOptions) {
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(CategorySchema),
		mode: "onChange",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: emptyCategoryFormDefaults,
	});

	useEffect(() => {
		form.reset(category ? mapCategoryToFormPayload(category) : { ...emptyCategoryFormDefaults });
	}, [category, isOpen, form]);

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const submit = handleSubmit((data) => {
		onSave({ ...data });
	});

	const canSave = isValid && !isSaving && (category ? isDirty : true);

	return {
		form,
		canSave,
		submit,
	};
}
