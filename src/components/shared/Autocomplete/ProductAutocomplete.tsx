import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Product, ProductType } from "models/product";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete from "./Autocomplete";

interface ProductAutocompleteProps {
	value: Product | null;
	type: ProductType;
	inputRef?: React.Ref<HTMLInputElement>;
	onChange(v: Product | null): void;
	onKeyDown?: (
		event: React.KeyboardEvent<HTMLDivElement> & {
			defaultMuiPrevented?: boolean;
		},
	) => void;
}

const ProductAutocomplete: React.FC<ProductAutocompleteProps> = ({
	value,
	type,
	inputRef,
	onChange,
	onKeyDown,
}) => {
	const { productStore } = useStore();

	const options = useMemo(() => {
		if (productStore.allProducts === "loading") {
			return [];
		}

		if (type === "Sale") {
			return productStore.saleProducts;
		} else if (type === "Supply") {
			return productStore.supplyProducts;
		} else {
			return productStore.allProducts;
		}
	}, [productStore.saleProducts, productStore.supplyProducts, type]);

	return (
		<EntityAutocomplete<Product>
			label={translate("fieldProduct")}
			placeholder={translate("searchProductsPlaceholder")}
			options={options === "loading" ? [] : options}
			value={value}
			inputRef={inputRef}
			onChange={onChange}
			onKeyDown={onKeyDown}
			additionalFilter={(p, text) => p.sku.toLowerCase().includes(text)}
		/>
	);
};

export default observer(ProductAutocomplete);
