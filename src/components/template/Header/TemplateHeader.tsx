import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";

interface TemplateHeaderProps {
	searchValue: string;
	selectedPartner: Partner | null;
	titleCount: string;

	onSearch: (value: string) => void;
	onPartnerChange: (value: Partner | null) => void;
	onCreate: () => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
	searchValue,
	selectedPartner,
	titleCount,
	onSearch,
	onPartnerChange,
	onCreate,
}) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{`${translate("templatesTitle")}(${titleCount})`}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("searchTemplatesPlaceholder")}
			/>
			<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
				<PartnerAutocomplete
					value={selectedPartner}
					type="All"
					size="small"
					onChange={onPartnerChange}
				/>
			</FormControl>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("add")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default TemplateHeader;
