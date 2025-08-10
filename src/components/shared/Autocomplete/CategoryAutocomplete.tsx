import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { Category } from "models/category";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface CategoryAutocompleteProps {
	value: Category | null;
	size?: AutocompleteSize;
	onChange: (value: Category | null) => void;
}

const CategoryAutocomplete: React.FC<CategoryAutocompleteProps> = ({ value, size, onChange }) => {
	const { categoryStore } = useStore();

	const options = useMemo(
		() => (categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories),
		[categoryStore.allCategories],
	);

	const loading = categoryStore.allCategories === "loading";

	return (
		<EntityAutocomplete<Category>
			label={translate("category.title.autocomplete")}
			placeholder={translate("category.title.search")}
			options={options}
			value={value}
			size={size}
			loading={loading}
			disabled={loading}
			onChange={onChange}
		/>
	);
};

export default CategoryAutocomplete;
