import React, { JSX } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

export interface IProps {
	title?: string;
	searchValue: string;
	onCreate: () => void;
	onSearch: (value: string) => void;
}

const CategoryHeader: React.FC<IProps> = ({
	title,
	searchValue,
	onCreate,
	onSearch,
}): JSX.Element => {
	return (
		<Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
			<Typography variant="h5">{title}</Typography>
			<Box display="flex" alignItems="center" mt={{ xs: 2, sm: 0 }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={translate("category.searchTitle")}
				/>
				<Box ml={2}>
					<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
						{translate("common.create")}
					</PrimaryButton>
				</Box>
			</Box>
		</Box>
	);
};

export default CategoryHeader;
