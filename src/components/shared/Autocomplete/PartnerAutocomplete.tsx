import React from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Partner } from "models/partner";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete from "./Autocomplete";

interface PartnerAutocompleteProps {
	value: Partner | null;
	onChange(v: Partner | null): void;
}

const PartnerAutocomplete: React.FC<PartnerAutocompleteProps> = ({ value, onChange }) => {
	const { partnersStore } = useStore();
	const options = partnersStore.allSuppliers === "loading" ? [] : partnersStore.allSuppliers;

	return (
		<EntityAutocomplete<Partner>
			label={translate("fieldSupplier")}
			placeholder={translate("searchSuppliersPlaceholder")}
			options={options}
			value={value}
			onChange={onChange}
		/>
	);
};

export default observer(PartnerAutocomplete);
