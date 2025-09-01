import React from "react";
import { translate } from "i18n/i18n";
import { PartnerTypeFilters } from "stores/PartnerStore";

import { MenuItem, Select } from "@mui/material";

const PARTNER_TYPES: PartnerTypeFilters[] = ["All", "Both", "Customer", "Supplier"];

interface PartnerTypeSelectProps {
	type: PartnerTypeFilters;
	onChange: (type: PartnerTypeFilters) => void;
}

export const PartnerTypeSelect: React.FC<PartnerTypeSelectProps> = ({ type, onChange }) => (
	<Select
		size="small"
		labelId="partner-type-label"
		value={type}
		onChange={(e) => onChange(e.target.value as PartnerTypeFilters)}
		sx={{ minWidth: 200 }}
	>
		{PARTNER_TYPES.map((t) => (
			<MenuItem key={t} value={t}>
				{translate(`partner.filter.${t}`)}
			</MenuItem>
		))}
	</Select>
);
