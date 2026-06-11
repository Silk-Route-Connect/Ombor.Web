import React from "react";
import { useTranslation } from "react-i18next";
import { TEMPLATE_TYPES, TemplateType } from "models/template";

import { MenuItem, Select, SelectProps } from "@mui/material";

interface TemplateTypeSelectProps {
	type: TemplateType;
	minWidth?: number;
	onTypeChange: (value: TemplateType) => void;
}

const TemplateTypeSelect: React.FC<TemplateTypeSelectProps & SelectProps> = ({
	type,
	minWidth = 200,
	onTypeChange,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<Select
			size={props.size}
			labelId="template-type-select"
			value={type}
			onChange={(e) => onTypeChange(e.target.value)}
			sx={{ minWidth: minWidth }}
		>
			{TEMPLATE_TYPES.map((templateType) => (
				<MenuItem key={templateType} value={templateType}>
					{t(`template.type.${templateType}`)}
				</MenuItem>
			))}
		</Select>
	);
};

export default TemplateTypeSelect;
