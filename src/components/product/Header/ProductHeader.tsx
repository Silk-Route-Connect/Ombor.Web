import React from "react";
import { useTranslation } from "react-i18next";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { Category } from "models/category";
import { ProductTypeFilter } from "stores/ProductStore";
import { designTokens } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

/** Archive view: the «Активные | Архив» segmented control swaps the whole list. */
type ArchiveView = "active" | "archived";

interface ProductHeaderProps {
	/** Total dataset size (unfiltered, archived included) shown in the title. */
	totalCount: number | null;
	searchValue: string;
	selectedCategory: Category | null;
	typeFilter: ProductTypeFilter;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onCategoryChange: (category: Category | null) => void;
	onTypeChange: (filter: ProductTypeFilter) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

const TYPE_TABS: ProductTypeFilter[] = ["all", "sale", "supply", "both"];

/**
 * Products page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; view-shaping controls (search, category
 * typeahead, type tabs, archive toggle) sit on the filter row below.
 */
const ProductHeader: React.FC<ProductHeaderProps> = ({
	totalCount,
	searchValue,
	selectedCategory,
	typeFilter,
	showArchived,
	archivedCount,
	onSearch,
	onCategoryChange,
	onTypeChange,
	onToggleArchived,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const title = totalCount == null ? t("product.title") : `${t("product.title")} (${totalCount})`;

	return (
		<>
			<PageHeader
				title={title}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("common.export")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("product.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("product.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 300 } }}
				/>

				{/* Entity filters are typeahead (convention); small fixed sets stay tabs. */}
				<CategoryAutocomplete
					mode="entity"
					value={selectedCategory}
					size="small"
					label=""
					placeholder={t("product.filter.allCategories")}
					sx={{
						width: 220,
						// Bundle .sdrop-trig: surface bg with the strong border.
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
						"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
					}}
					onChange={onCategoryChange}
				/>

				<SegmentedControl<ProductTypeFilter>
					options={TYPE_TABS.map((tab) => ({ value: tab, label: t(`product.filter.type.${tab}`) }))}
					value={typeFilter}
					onChange={onTypeChange}
				/>

				<Box sx={{ flexGrow: 1 }} />

				<SegmentedControl<ArchiveView>
					options={[
						{ value: "active", label: t("product.filter.active") },
						{
							value: "archived",
							label:
								archivedCount > 0
									? `${t("product.filter.archive")} (${archivedCount})`
									: t("product.filter.archive"),
						},
					]}
					value={showArchived ? "archived" : "active"}
					onChange={(view) => onToggleArchived(view === "archived")}
				/>
			</Box>
		</>
	);
};

export default ProductHeader;
