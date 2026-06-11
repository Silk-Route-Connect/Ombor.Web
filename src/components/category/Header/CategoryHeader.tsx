import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

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
			<Typography variant="h5">{title}</Typography>
			<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
				<FormControl margin="dense">
					<SearchInput
						value={searchValue}
						onChange={onSearch}
						placeholder={t("category.searchTitle")}
					/>
				</FormControl>

				<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
					{t("common.create")}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default CategoryHeader;
