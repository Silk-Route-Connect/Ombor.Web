import React from "react";
import { useTranslation } from "react-i18next";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import ExportButton from "components/shared/Buttons/ExportButton";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { Category } from "models/category";
import { ProductTypeFilter, StockFilter } from "stores/ProductStore";

import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { Box } from "@mui/material";

/** Archive view: the «Активные | Архив» segmented control swaps the whole list. */
type ArchiveView = "active" | "archived";

interface ProductHeaderProps {
	searchValue: string;
	selectedCategory: Category | null;
	typeFilter: ProductTypeFilter;
	stockFilter: StockFilter;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onCategoryChange: (category: Category | null) => void;
	onTypeChange: (filter: ProductTypeFilter) => void;
	onStockChange: (filter: StockFilter) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

const TYPE_TABS: ProductTypeFilter[] = ["all", "sale", "supply", "both"];
const STOCK_FILTERS: StockFilter[] = ["all", "low", "out"];

/**
 * Products page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; view-shaping controls (search, category
 * typeahead, type tabs, «Остаток» low-stock filter, archive toggle) sit on the
 * filter row below.
 */
const ProductHeader: React.FC<ProductHeaderProps> = ({
	searchValue,
	selectedCategory,
	typeFilter,
	stockFilter,
	showArchived,
	archivedCount,
	onSearch,
	onCategoryChange,
	onTypeChange,
	onStockChange,
	onToggleArchived,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	const title = t("product.title");

	return (
		<>
			<PageHeader
				title={title}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
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
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
					}}
					onChange={onCategoryChange}
				/>

				<SegmentedControl<ProductTypeFilter>
					options={TYPE_TABS.map((tab) => ({ value: tab, label: t(`product.filter.type.${tab}`) }))}
					value={typeFilter}
					onChange={onTypeChange}
				/>

				<EntityFilterSelect<StockFilter>
					label={t("product.filter.stock.label")}
					icon={<Inventory2OutlinedIcon />}
					value={stockFilter}
					options={STOCK_FILTERS.map((filter) => ({
						value: filter,
						label: t(`product.filter.stock.${filter}`),
					}))}
					onChange={onStockChange}
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
