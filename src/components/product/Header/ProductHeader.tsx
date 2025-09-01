import React, { JSX } from "react";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Category } from "models/category";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

interface CategoryHeaderProps {
	title: string;
	searchValue: string;
	selectedCategory: Category | null;

	onSearch: (value: string) => void;
	onCategoryChange: (category: Category | null) => void;
	onCreate: () => void;
}

export const ProductHeader: React.FC<CategoryHeaderProps> = ({
	title,
	searchValue,
	selectedCategory,
	onSearch,
	onCategoryChange,
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
		<Typography variant="h5">{title}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("product.title.search")}
			/>

			<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
				<CategoryAutocomplete value={selectedCategory} onChange={onCategoryChange} size="small" />
			</FormControl>

			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("common.create")}
			</PrimaryButton>
		</Box>
	</Box>
);
