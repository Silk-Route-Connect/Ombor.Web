import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Category } from "models/category";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface CategoryAutocompleteCommonProps {
	size?: AutocompleteSize;
	disabled?: boolean;
	required?: boolean;
	error?: boolean;
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

function isIdMode(p: CategoryAutocompleteProps): p is CategoryAutocompleteIdProps {
	return p.mode === "id";
}

const CategoryAutocompleteComponent: React.FC<CategoryAutocompleteProps> = (props) => {
	const { categoryStore } = useStore();

	const options: Category[] = useMemo(
		() => (categoryStore.allCategories === "loading" ? [] : categoryStore.allCategories),
		[categoryStore.allCategories],
	);

	const loading = categoryStore.allCategories === "loading";
	const isDisabled = Boolean(props.disabled) || loading;

	const selectedValue = useMemo(() => {
		if (props.value == null) {
			return null;
		}

		if (isIdMode(props)) {
			return options.find((c) => c.id === props.value) ?? null;
		}

		return props.value ?? null;
	}, [props, options]);

	const handleChange = (value: Category | null) => {
		if (props.mode === "id") {
			props.onChange(value?.id ?? null);
		} else {
			props.onChange(value);
		}
	};

	return (
		<EntityAutocomplete<Category>
			label={translate("category.title.autocomplete")}
			placeholder={translate("category.title.search")}
			options={options}
			value={selectedValue}
			size={props.size}
			loading={loading}
			disabled={isDisabled}
			required={props.required}
			error={props.error}
			onChange={handleChange}
		/>
	);
};

export default observer(CategoryAutocompleteComponent);
