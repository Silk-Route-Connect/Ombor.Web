import React, { useMemo } from "react";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Partner, PartnerType } from "models/partner";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface PartnerAutocompleteProps {
	type: PartnerType;
	value: Partner | null;
	size?: AutocompleteSize;
	onChange(value: Partner | null): void;
}

const PartnerAutocomplete: React.FC<PartnerAutocompleteProps> = ({
	type,
	value,
	size,
	onChange,
}) => {
	const { partnerStore } = useStore();

	const options = useMemo(() => {
		if (type === "Customer") {
			return partnerStore.customers;
		} else if (type === "Supplier") {
			return partnerStore.suppliers;
		} else {
			return partnerStore.allPartners;
		}
	}, [partnerStore.allPartners, type]);

	return (
		<EntityAutocomplete<Partner>
			label={translate("partnerAutocomplete.partner")}
			placeholder={translate("partnerAutocomplete.search")}
			options={options === "loading" ? [] : options}
			value={value}
			size={size}
			onChange={onChange}
			loading={options === "loading"}
			disabled={options === "loading"}
		/>
	);
};

export default observer(PartnerAutocomplete);
