import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Category } from "models/category";
import { CategoryFormValues, CategorySchema } from "schemas/CategorySchema";

export type CategoryFormPayload = {
	name: string;
	description?: string;
};

export function useCategoryForm(isOpen: boolean, category?: Category | null) {
	const form = useForm<CategoryFormValues>({
		resolver: zodResolver(CategorySchema),
		mode: "onChange",
		defaultValues: { name: "", description: "" },
		reValidateMode: "onChange",
		criteriaMode: "all",
	});

	useEffect(() => {
		form.reset(
			category
				? { name: category.name, description: category.description ?? "" }
				: { name: "", description: "" },
		);
	}, [category, isOpen]);

	return form;
}
