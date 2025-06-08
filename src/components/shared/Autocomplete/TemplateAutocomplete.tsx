import React from "react";
import EntityAutocomplete from "components/shared/Autocomplete/Autocomplete";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import type { Template } from "models/template";
import { useStore } from "stores/StoreContext";

interface Props {
	value: Template | null;
	onChange(v: Template | null): void;
}

const TemplateAutocomplete: React.FC<Props> = ({ value, onChange }) => {
	const { templateStore } = useStore();
	const options =
		templateStore.allTemplates === "loading"
			? []
			: templateStore.allTemplates.filter((t) => t.type === "supply");

	return (
		<EntityAutocomplete<Template>
			label={translate("fieldTemplate")}
			placeholder={translate("templateSearchPlaceholder")}
			options={options}
			value={value}
			onChange={onChange}
		/>
	);
};

export default observer(TemplateAutocomplete);
