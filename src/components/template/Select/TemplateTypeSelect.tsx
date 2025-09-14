import React from "react";
import { translate } from "i18n/i18n";
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
}) => (
	<Select
		size={props.size}
		labelId="template-type-select"
		value={type}
		onChange={(e) => onTypeChange(e.target.value)}
		sx={{ minWidth: minWidth }}
	>
		{TEMPLATE_TYPES.map((t) => (
			<MenuItem key={t} value={t}>
				{translate(`template.type.${t}`)}
			</MenuItem>
		))}
	</Select>
);

export default TemplateTypeSelect;
