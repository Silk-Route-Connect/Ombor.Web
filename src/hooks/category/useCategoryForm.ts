import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "models/category";
import { CategoryFormValues, CategorySchema } from "schemas/CategorySchema";
import { emptyCategoryFormDefaults, mapCategoryToFormPayload } from "utils/categoryUtils";

export type CategoryFormPayload = CategoryFormValues;

export interface UseCategoryFormOptions {
	isOpen: boolean;
	isSaving: boolean;
	category: Category | null;
	onSave: (payload: CategoryFormPayload) => void;
}

export function useCategoryForm({ isOpen, isSaving, category, onSave }: UseCategoryFormOptions) {
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

	const { handleSubmit } = form;

	const submit = handleSubmit((data) => {
		onSave({ ...data });
	});

	// Save stays enabled (CLAUDE.md hard rule 5 / conventions: buttons are never
	// silently disabled). Validation runs on submit and reports inline per field;
	// the button is only inert while a save is in flight to prevent double-submit.
	const canSave = !isSaving;

	return {
		form,
		canSave,
		submit,
	};
}
