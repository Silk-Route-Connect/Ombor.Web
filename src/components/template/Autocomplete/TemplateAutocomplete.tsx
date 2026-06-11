import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import EntityAutocomplete, { AutocompleteSize } from "components/shared/Autocomplete/Autocomplete";
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
	const { t } = useTranslation();
	const { templateStore } = useStore();

	useEffect(() => {
		templateStore.setSelectedPartner(partner);
	}, [partner]);

	const options = type === "Sale" ? templateStore.saleTemplates : templateStore.supplyTemplates;

	return (
		<EntityAutocomplete<Template>
			label={t("fieldTemplate")}
			placeholder={t("templateSearchPlaceholder")}
			options={options === "loading" ? [] : options}
			value={value}
			size={size}
			loading={options === "loading"}
			disabled={options === "loading"}
			onChange={onChange}
		/>
	);
};

export default observer(TemplateAutocomplete);
