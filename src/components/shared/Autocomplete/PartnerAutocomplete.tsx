import React from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Partner, PartnerType } from "models/partner";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface PartnerAutocompleteProps {
	type: Exclude<PartnerType, "All">;
	value: Partner | null;
	size?: AutocompleteSize;
	onChange(v: Partner | null): void;
}

const PartnerAutocomplete: React.FC<PartnerAutocompleteProps> = ({
	type,
	value,
	size,
	onChange,
}) => {
	const { partnerStore } = useStore();
	const options = type === "Customer" ? partnerStore.customers : partnerStore.suppliers;

	return (
		<EntityAutocomplete<Partner>
			label={translate("partnerAutocomplete.partner")}
			placeholder={translate("partnerAutocomplete.search")}
			options={options === "loading" ? [] : options}
			value={value}
			size={size}
			onChange={onChange}
		/>
	);
};

export default observer(PartnerAutocomplete);
