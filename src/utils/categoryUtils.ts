import { Category } from "models/category";
import { CategoryFormInputs } from "schemas/CategorySchema";

export const emptyCategoryFormDefaults: CategoryFormInputs = {
	name: "",
	description: "",
};

export const mapCategoryToFormPayload = (category: Category): CategoryFormInputs => {
	return {
		name: category.name,
		description: category.description ?? null,
	};
};
