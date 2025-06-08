import React from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Supplier } from "models/supplier";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete from "./Autocomplete";

interface Props {
	value: Supplier | null;
	onChange(v: Supplier | null): void;
}

const SupplierAutocomplete: React.FC<Props> = ({ value, onChange }) => {
	const { supplierStore } = useStore();
	const options = supplierStore.allSuppliers === "loading" ? [] : supplierStore.allSuppliers;

	return (
		<EntityAutocomplete<Supplier>
			label={translate("fieldSupplier")}
			placeholder={translate("searchSuppliersPlaceholder")}
			options={options}
			value={value}
			onChange={onChange}
		/>
	);
};

export default observer(SupplierAutocomplete);
