import React, { JSX } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";
import { PartnerTypeSelect } from "components/partner/PartnerTypeSelect/PartnerTypeSelect";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { PartnerTypeFilters } from "stores/PartnerStore";

interface PartnerHeaderProps {
	searchValue: string;
	patnerType: PartnerTypeFilters;

	onSearch: (value: string) => void;
	onPartnerTypeChange: (type: PartnerTypeFilters) => void;
	onCreate: () => void;
}

const PartnerHeader: React.FC<PartnerHeaderProps> = ({
	searchValue,
	patnerType,
	onSearch,
	onPartnerTypeChange,
	onCreate,
}): JSX.Element => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{translate("partner.title")}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("partner.searchPlaceholder")}
			/>
			<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
				<PartnerTypeSelect type={patnerType} onChange={onPartnerTypeChange} />
			</FormControl>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("partner.addButton")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default PartnerHeader;
