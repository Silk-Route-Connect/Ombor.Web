import React from "react";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Partner } from "models/partner";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

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
}) => {
	const { t } = useTranslation();

	return (
		<Box
			display="flex"
			flexWrap="wrap"
			justifyContent="space-between"
			alignItems="center"
			mb={3}
			sx={{ gap: 2 }}
		>
			<Typography variant="h5">{`${t("templatesTitle")}(${titleCount})`}</Typography>
			<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("searchTemplatesPlaceholder")}
				/>
				<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
					<PartnerAutocomplete
						value={selectedPartner}
						type="Both"
						size="small"
						onChange={onPartnerChange}
					/>
				</FormControl>
				<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
					{t("add")}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default TemplateHeader;
