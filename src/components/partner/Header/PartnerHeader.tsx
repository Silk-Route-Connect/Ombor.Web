import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { PartnerTypeSelect } from "components/partner/PartnerTypeSelect/PartnerTypeSelect";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { PartnerTypeFilters } from "stores/PartnerStore";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

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
}): JSX.Element => {
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
			<Typography variant="h5">{t("partner.title")}</Typography>
			<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("partner.searchPlaceholder")}
				/>
				<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
					<PartnerTypeSelect type={patnerType} onChange={onPartnerTypeChange} />
				</FormControl>
				<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
					{t("partner.addButton")}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default PartnerHeader;
