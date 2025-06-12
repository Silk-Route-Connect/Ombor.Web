import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

interface TemplateHeaderProps {
	searchValue: string;
	onSearch: (value: string) => void;
	onCreate: () => void;
}

const TemplateHeader: React.FC<TemplateHeaderProps> = ({ searchValue, onSearch, onCreate }) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{translate("templatesTitle")}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("searchTemplatesPlaceholder")}
			/>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("add")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default TemplateHeader;
