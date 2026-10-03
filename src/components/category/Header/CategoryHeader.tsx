import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";

import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/material";

interface CategoryHeaderProps {
	searchValue: string;
	onCreate: () => void;
	onSearch: (value: string) => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
	searchValue,
	onCreate,
	onSearch,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("category.title")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("category.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ mb: 2 }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("category.searchPlaceholder")}
				/>
			</Box>
		</>
	);
};

export default CategoryHeader;
