import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

export type CategoryOption = {
	id: number;
	name: string;
};

interface Props {
	searchValue: string;
	categoryOptions: CategoryOption[];
	selectedCategory: number | null;
	onSearch: (value: string) => void;
	onCategoryChange: (categoryId: number | null) => void;
	onCreate: () => void;
}

export const ProductHeader: React.FC<Props> = ({
	searchValue,
	categoryOptions,
	selectedCategory,
	onSearch,
	onCategoryChange,
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
		<Typography variant="h5">{translate("product.title")}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput value={searchValue} onChange={onSearch} placeholder="Поиск товаров..." />
			<Select<number | "">
				value={selectedCategory ?? ""}
				onChange={(e: SelectChangeEvent<number | "">) => {
					onCategoryChange(e.target.value === "" ? null : Number(e.target.value));
				}}
				displayEmpty
				size="small"
				sx={{ minWidth: 160 }}
				MenuProps={{ PaperProps: { style: { maxHeight: 350 } } }}
			>
				<MenuItem value="">{translate("product.allCategories")}</MenuItem>
				{categoryOptions.map((cat) => (
					<MenuItem key={cat.id} value={cat.id}>
						{cat.name}
					</MenuItem>
				))}
			</Select>

			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				Добавить
			</PrimaryButton>
		</Box>
	</Box>
);
