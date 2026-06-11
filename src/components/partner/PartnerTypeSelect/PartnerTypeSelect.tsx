import React from "react";
import { useTranslation } from "react-i18next";
import { PartnerTypeFilters } from "stores/PartnerStore";

import { MenuItem, Select } from "@mui/material";

const PARTNER_TYPES: PartnerTypeFilters[] = ["All", "Both", "Customer", "Supplier"];

interface PartnerTypeSelectProps {
	type: PartnerTypeFilters;
	onChange: (type: PartnerTypeFilters) => void;
}

export const PartnerTypeSelect: React.FC<PartnerTypeSelectProps> = ({ type, onChange }) => {
	const { t } = useTranslation();
	return (
		<Select
			size="small"
			labelId="partner-type-label"
			value={type}
			onChange={(e) => onChange(e.target.value as PartnerTypeFilters)}
			sx={{ minWidth: 200 }}
		>
			{PARTNER_TYPES.map((partnerType) => (
				<MenuItem key={partnerType} value={partnerType}>
					{t(`partner.filter.${partnerType}`)}
				</MenuItem>
			))}
		</Select>
	);
};
