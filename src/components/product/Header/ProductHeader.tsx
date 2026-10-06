import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Category } from "models/category";
import { ProductTypeFilter, StockFilter } from "stores/ProductStore";
import { useStore } from "stores/StoreContext";
import { byLabel } from "utils/sortUtils";

import AddIcon from "@mui/icons-material/Add";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
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

const ALL = "all";
const TYPE_TABS: ProductTypeFilter[] = ["all", "sale", "supply", "both"];
const STOCK_FILTERS: StockFilter[] = ["all", "low", "out"];

/**
 * Products page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; view-shaping controls (search, then the
 * «Категория» / «Тип» / «Остаток» filters — one dropdown look for every filter —
 * and the archive toggle) sit on the filter row below, one line at 1366px.
 */
const ProductHeader: React.FC<ProductHeaderProps> = observer(
	({
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
		const { categoryStore } = useStore();
		const categories = readyOr(categoryStore.allCategories, []);
		const categoryOptions = byLabel(
			categories.map((category) => ({ value: String(category.id), label: category.name })),
			(option) => option.label,
		);

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

					<EntityFilterSelect<string>
						label={t("product.filter.category")}
						icon={<LocalOfferOutlinedIcon />}
						value={selectedCategory ? String(selectedCategory.id) : ALL}
						allValue={ALL}
						allLabel={t("common.all")}
						options={categoryOptions}
						onChange={(id) =>
							onCategoryChange(
								id === ALL ? null : (categories.find((c) => String(c.id) === id) ?? null),
							)
						}
					/>

					<EntityFilterSelect<ProductTypeFilter>
						label={t("product.filter.type.label")}
						icon={<LayersOutlinedIcon />}
						value={typeFilter}
						options={TYPE_TABS.map((tab) => ({
							value: tab,
							label: t(`product.filter.type.${tab}`),
						}))}
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
	},
);

export default ProductHeader;
