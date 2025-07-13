import React, { useEffect } from "react";
import EntityAutocomplete, { AutocompleteSize } from "components/shared/Autocomplete/Autocomplete";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import type { Template, TemplateType } from "models/template";
import { useStore } from "stores/StoreContext";

interface Props {
	value: Template | null;
	type: TemplateType;
	partner: Partner | null;
	size?: AutocompleteSize;
	onChange(v: Template | null): void;
}

const TemplateAutocomplete: React.FC<Props> = ({
	value,
	type,
	partner,
	size = "medium",
	onChange,
}) => {
	const { templateStore } = useStore();

	useEffect(() => {
		templateStore.setSelectedPartner(partner);
	}, [partner]);

	const options = type === "Sale" ? templateStore.saleTemplates : templateStore.supplyTemplates;

	console.log(options);

	return (
		<EntityAutocomplete<Template>
			label={translate("fieldTemplate")}
			placeholder={translate("templateSearchPlaceholder")}
			options={options === "loading" ? [] : options}
			value={value}
			size={size}
			onChange={onChange}
		/>
	);
};

export default observer(TemplateAutocomplete);
