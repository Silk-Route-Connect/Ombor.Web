import React, { JSX } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

interface CategoryHeaderProps {
	title?: string;
	searchValue: string;

	onCreate: () => void;
	onSearch: (value: string) => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
	title,
	searchValue,
	onCreate,
	onSearch,
}): JSX.Element => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{title}</Typography>
		<Box display="flex" alignItems="center" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("category.searchTitle")}
			/>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("common.create")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default CategoryHeader;
