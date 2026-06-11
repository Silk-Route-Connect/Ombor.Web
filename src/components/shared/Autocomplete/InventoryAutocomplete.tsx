import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { Inventory } from "models/inventory";
import { useStore } from "stores/StoreContext";

import EntityAutocomplete, { AutocompleteSize } from "./Autocomplete";

interface InventoryAutocompleteProps {
	value: Inventory | null;
	size?: AutocompleteSize;
	onChange(value: Inventory | null): void;
}

const PartnerAutocomplete: React.FC<InventoryAutocompleteProps> = ({ value, size, onChange }) => {
	const { t } = useTranslation();
	const { inventoryStore } = useStore();

	useEffect(() => {
		if (inventoryStore.inventories.length === 0) {
			inventoryStore.getAll();
		}
	}, [inventoryStore]);

	const options = useMemo(
		() => (inventoryStore.inventories === "loading" ? [] : inventoryStore.inventories),
		[inventoryStore.inventories],
	);

	return (
		<EntityAutocomplete<Inventory>
			label={t("partnerAutocomplete.partner")}
			placeholder={t("partnerAutocomplete.search")}
			options={options}
			value={value}
			size={size}
			onChange={onChange}
		/>
	);
};

export default observer(PartnerAutocomplete);
