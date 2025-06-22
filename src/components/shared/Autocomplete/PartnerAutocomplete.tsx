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
	const { partnerStore: partnersStore } = useStore();
	const options = partnersStore.allPartners === "loading" ? [] : partnersStore.allPartners;
	console.log(options);

	return (
		<EntityAutocomplete<Partner>
			label={translate("partnerAutocomplete.partner")}
			placeholder={translate("partnerAutocomplete.search")}
			options={options}
			value={value}
			onChange={onChange}
		/>
	);
};

export default observer(PartnerAutocomplete);
