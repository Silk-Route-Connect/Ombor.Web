import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

interface CategoryHeaderProps {
	searchValue: string;
	onCreate: () => void;
	onSearch: (value: string) => void;
	onExport: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
	searchValue,
	onCreate,
	onSearch,
	onExport,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("category.title")}
				actions={
					<>
						<GhostButton icon={<FileDownloadOutlinedIcon />} onClick={onExport}>
							{t("common.export")}
						</GhostButton>
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
