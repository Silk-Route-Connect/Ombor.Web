import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { Category } from "models/category";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface CategoryAutocompleteProps {
	value: Category | null;
	size?: AutocompleteSize;
	disabled?: boolean;
	onChange: (value: Category | null) => void;
}

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({
	value,
	size,
	disabled,
	onChange,
}) => {
	const { categoryStore } = useStore();

	const options = useMemo(
		() => (categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories),
		[categoryStore.allCategories],
	);

	const loading = categoryStore.allCategories === "loading";
	disabled ??= loading;

	return (
		<EntityAutocomplete<Category>
			label={translate("category.title.autocomplete")}
			placeholder={translate("category.title.search")}
			options={options}
			value={value}
			size={size}
			loading={loading}
			disabled={disabled}
			onChange={onChange}
		/>
	);
};

export default CategoryAutocomplete;
