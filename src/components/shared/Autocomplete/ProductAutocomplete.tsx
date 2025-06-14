import React from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Product, ProductType } from "models/product";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete from "./Autocomplete";

interface Props {
	value: Product | null;
	type: ProductType;
	onChange(v: Product | null): void;
	onKeyDown?: (
		event: React.KeyboardEvent<HTMLDivElement> & {
			defaultMuiPrevented?: boolean;
		},
	) => void;
}

const ProductAutocomplete: React.FC<Props> = ({ value, type, onChange, onKeyDown }) => {
	const { productStore } = useStore();
	const options = productStore.allProducts === "loading" ? [] : productStore.allProducts;
	console.log(type);
	console.log(options);

	return (
		<EntityAutocomplete<Product>
			label={translate("fieldProduct")}
			placeholder={translate("searchProductsPlaceholder")}
			options={options}
			value={value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
		/>
	);
};

export default observer(ProductAutocomplete);
