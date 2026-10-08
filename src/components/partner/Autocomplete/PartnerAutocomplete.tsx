import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isLoading, isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import type { Partner, PartnerType } from "models/partner";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "../../shared/Autocomplete/Autocomplete";

interface PartnerAutocompleteProps {
	type: PartnerType;
	value: Partner | null;
	size?: AutocompleteSize;
	error?: boolean;
	helperText?: React.ReactNode;
	onChange(value: Partner | null): void;
}

const PartnerAutocomplete: React.FC<PartnerAutocompleteProps> = ({
	type,
	value,
	size,
	error,
	helperText,
	onChange,
}) => {
	const { t } = useTranslation();
	const { partnerStore } = useStore();

	const options = useMemo(() => {
		if (type === "Customer") {
			return partnerStore.customers;
		} else if (type === "Supplier") {
			return partnerStore.suppliers;
		}
		// `Both` must not offer archived partners (rule 30) — the Customer/Supplier
		// getters already exclude them; the raw `allPartners` list does not (F15).
		const all = partnerStore.allPartners;
		return !isReady(all) ? all : all.filter((p) => !p.isArchived);
	}, [partnerStore.customers, partnerStore.suppliers, partnerStore.allPartners, type]);

	return (
		<EntityAutocomplete<Partner>
			placeholder={t("partnerAutocomplete.search")}
			options={readyOr(options, [])}
			value={value}
			size={size}
			error={error}
			helperText={helperText}
			onChange={onChange}
			loading={isLoading(options)}
			disabled={isLoading(options)}
			isOptionEqualToValue={(opt, val) => opt.id === val.id}
		/>
	);
};

export default observer(PartnerAutocomplete);
