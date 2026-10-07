import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import StockQuantityCell from "components/product/StockQuantityCell";
import DetailTable from "components/shared/Detail/DetailTable";
import DetailTableCard from "components/shared/Detail/DetailTableCard";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import SkuCell from "components/shared/Table/cells/SkuCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import TableEmptyState from "components/shared/Table/TableEmptyState";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { ALL_CATEGORIES, WarehouseStockFilters } from "hooks/warehouse/useWarehouseStockFilters";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { numericSx } from "theme";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { matchesStockFilter, StockFilter, StockLevel } from "utils/productFilters";
import { measurementShort } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import { Box, Stack } from "@mui/material";

interface WarehouseStockTabProps {
	warehouse: Warehouse;
	stock: WarehouseStockItem[];
	/** Shown in the empty state of a warehouse with no stock yet (omit when archived). */
	onAddOpeningStock?: () => void;
	/** Each product's served alert in this warehouse (`warehouseStockLevels`); a missing one is «ok». */
	levels: ReadonlyMap<number, StockLevel>;
	/** Search, category and «Остаток» — held by the page (the «Заканчивается» KPI sets them). */
	filters: WarehouseStockFilters;
}

type StockRow = WarehouseStockItem & { id: number; level: StockLevel };

const STOCK_FILTERS: StockFilter[] = ["all", "low", "out"];

/**
 * «Остатки»: the warehouse's on-hand products — Товар · Артикул · Категория ·
 * Количество · Сред. себест. · Стоимость — searchable, filterable by category
 * and by the low-stock alert, with the served «Итого по складу» band on the
 * unfiltered view. The alert is the served one — this warehouse's quantity at
 * or below the product's «Минимальный остаток» — so «Остаток: Заканчивается»
 * lists exactly the rows the «Заканчивается» KPI counts.
 */
export const WarehouseStockTab: React.FC<WarehouseStockTabProps> = ({
	warehouse,
	stock,
	onAddOpeningStock,
	levels,
	filters,
}) => {
	const { t } = useTranslation();
	const tableOrder = useTableOrder<StockRow>();
	const { query, setQuery, category, setCategory, stockFilter, setStockFilter, isFiltering } =
		filters;

	const categories = useMemo(() => {
		const names = new Set<string>();
		stock.forEach((item) => item.categoryName && names.add(item.categoryName));
		return [...names].sort((a, b) => a.localeCompare(b, "ru"));
	}, [stock]);

	const rows = useMemo<StockRow[]>(
		() =>
			stock
				.map((item) => ({
					...item,
					id: item.productId,
					level: levels.get(item.productId) ?? "ok",
				}))
				.filter(
					(item) =>
						(category === ALL_CATEGORIES || item.categoryName === category) &&
						matchesStockFilter(item.level, stockFilter) &&
						(!query.trim() ||
							matchesSearch(item.productName, query) ||
							matchesSearch(item.sku, query)),
				),
		[stock, query, category, stockFilter, levels],
	);

	const columns = useMemo<Column<StockRow>[]>(
		() => [
			{
				key: "name",
				headerName: t("warehouse.stock.product"),
				sortValue: (i) => i.productName,
				renderCell: (i) => <ProductLink id={i.productId} name={i.productName} />,
			},
			{
				key: "sku",
				headerName: t("warehouse.stock.sku"),
				sortValue: (i) => i.sku,
				renderCell: (i) => <SkuCell sku={i.sku} />,
			},
			{
				key: "category",
				headerName: t("warehouse.stock.category"),
				sortValue: (i) => i.categoryName ?? "",
				renderCell: (i) => <MutedTextCell text={i.categoryName} />,
			},
			{
				key: "quantity",
				headerName: t("warehouse.stock.quantity"),
				align: "right",
				sortValue: (i) => i.quantity,
				renderCell: (i) => (
					<StockQuantityCell quantity={i.quantity} measurement={i.measurement} level={i.level} />
				),
			},
			{
				key: "averageCost",
				headerName: t("warehouse.stock.wac"),
				headerTooltip: t("common.hint.wac"),
				align: "right",
				sortValue: (i) => i.averageCost,
				renderCell: (i) => <MoneyCell value={i.averageCost} />,
			},
			{
				key: "value",
				headerName: t("warehouse.stock.value"),
				align: "right",
				sortValue: (i) => i.value,
				renderCell: (i) => <MoneyCell value={i.value} main />,
			},
		],
		[t],
	);

	const handleExport = () => {
		exportToCsv<StockRow>(
			`warehouse_${warehouse.name}_stock_${csvDateStamp()}`,
			[
				{ header: t("warehouse.stock.product"), value: (i) => i.productName },
				{ header: t("warehouse.stock.sku"), value: (i) => i.sku },
				{ header: t("warehouse.stock.category"), value: (i) => i.categoryName ?? "" },
				{ header: t("warehouse.stock.quantity"), value: (i) => i.quantity },
				{ header: t("warehouse.stock.unit"), value: (i) => measurementShort(t, i.measurement) },
				{
					header: t("product.table.stockLevel"),
					value: (i) => (i.level === "ok" ? "" : t(`product.stockLevel.${i.level}`)),
				},
				{ header: t("warehouse.stock.wac"), value: (i) => i.averageCost },
				{ header: t("warehouse.stock.value"), value: (i) => i.value },
			],
			tableOrder.apply(rows),
		);
	};

	return (
		<DetailTableCard
			search={{
				value: query,
				onChange: setQuery,
				placeholder: t("warehouse.stock.searchPlaceholder"),
			}}
			filters={
				<Stack direction="row" sx={{ gap: "10px", flexWrap: "wrap" }}>
					<EntityFilterSelect
						label={t("warehouse.stock.categoryLabel")}
						value={category}
						allValue={ALL_CATEGORIES}
						allLabel={t("warehouse.stock.allCategories")}
						options={categories.map((name) => ({ value: name, label: name }))}
						onChange={setCategory}
						icon={<LocalOfferOutlinedIcon />}
					/>
					<EntityFilterSelect<StockFilter>
						label={t("product.filter.stock.label")}
						icon={<Inventory2OutlinedIcon />}
						value={stockFilter}
						options={STOCK_FILTERS.map((filter) => ({
							value: filter,
							label: t(`product.filter.stock.${filter}`),
						}))}
						onChange={setStockFilter}
					/>
				</Stack>
			}
			exportCsv={{ onExport: handleExport, rowCount: rows.length }}
		>
			<DetailTable<StockRow>
				exportOrder={tableOrder}
				rows={rows}
				columns={columns}
				defaultSort={{ key: "value", order: "desc" }}
				pagination
				storageKey="stock"
				empty={
					isFiltering ? (
						<TableEmptyState
							icon={<Inventory2OutlinedIcon />}
							title={t("warehouse.stock.emptyTitle")}
							hint={t("warehouse.stock.emptyBody")}
						/>
					) : (
						<TableEmptyState
							icon={<Inventory2OutlinedIcon />}
							title={t("warehouse.stock.noStockTitle")}
							hint={t("warehouse.stock.noStockBody")}
							action={
								onAddOpeningStock && {
									label: t("warehouse.opening.action"),
									onClick: onAddOpeningStock,
								}
							}
						/>
					)
				}
				footer={
					!isFiltering && (
						<tr className="total">
							<td colSpan={3}>{t("warehouse.stock.total")}</td>
							<Box component="td" className="r" sx={numericSx}>
								{formatQuantity(warehouse.totalUnits)}
							</Box>
							<td />
							<Box component="td" className="r" sx={numericSx}>
								{formatCurrency(warehouse.stockValue)}
							</Box>
						</tr>
					)
				}
			/>
		</DetailTableCard>
	);
};

export default WarehouseStockTab;
