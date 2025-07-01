import React, { useMemo } from "react";
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

	const options = useMemo(() => {
		if (productStore.allProducts === "loading") {
			return [];
		}

		if (type === "Supply") {
			return productStore.allProducts.filter((el) => el.type === "Supply");
		} else if (type === "Sale") {
			return productStore.allProducts.filter((el) => el.type === "Sale");
		} else {
			return productStore.allProducts;
		}
	}, [productStore.allProducts, type]);

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
