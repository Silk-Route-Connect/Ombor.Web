import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Category } from "models/category";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "../../shared/Autocomplete/Autocomplete";

interface CategoryAutocompleteCommonProps {
	size?: AutocompleteSize;
	disabled?: boolean;
	required?: boolean;
	error?: boolean;
	helperText?: React.ReactNode;
}

interface CategoryAutocompleteEntityProps extends CategoryAutocompleteCommonProps {
	mode?: "entity";
	value: Category | null;
	onChange: (value: Category | null) => void;
}

interface CategoryAutocompleteIdProps extends CategoryAutocompleteCommonProps {
	mode: "id";
	value: number | null;
	onChange: (value: number | null) => void;
}

type CategoryAutocompleteProps = CategoryAutocompleteEntityProps | CategoryAutocompleteIdProps;

const CategoryAutocompleteComponent: React.FC<CategoryAutocompleteProps> = ({
	mode,
	value,
	size,
	disabled,
	required,
	error,
	helperText,
	onChange,
}) => {
	const { categoryStore } = useStore();

	const options: Category[] = useMemo(
		() => (categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories),
		[categoryStore.allCategories],
	);

	const loading = categoryStore.allCategories === "loading";
	const isDisabled = Boolean(disabled) || loading;

	const selectedValue = useMemo(() => {
		if (value == null) {
			return null;
		}

		if (mode === "id") {
			return options.find((c) => c.id === value) ?? null;
		}

		return value ?? null;
	}, [mode, value, options]);

	const handleChange = (value: Category | null) => {
		if (mode === "id") {
			onChange(value?.id ?? null);
		} else {
			onChange(value);
		}
	};

	return (
		<EntityAutocomplete<Category>
			label={translate("category.title.autocomplete")}
			placeholder={translate("category.title.search")}
			options={options}
			value={selectedValue}
			size={size}
			loading={loading}
			disabled={isDisabled}
			required={required}
			error={error}
			helperText={helperText}
			onChange={handleChange}
		/>
	);
};

export default observer(CategoryAutocompleteComponent);
