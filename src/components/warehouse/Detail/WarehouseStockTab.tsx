import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DetailCard from "components/shared/Detail/DetailCard";
import DetailSortHeader, { SortDir } from "components/shared/Detail/DetailSortHeader";
import { detailTableSx } from "components/shared/Detail/detailTableChrome";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { compareValues } from "components/shared/Table/DataTable/tableConfigs";
import TablePager from "components/shared/Table/TablePager";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";

import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, MenuItem, TextField, Typography } from "@mui/material";

interface WarehouseStockTabProps {
	warehouse: Warehouse;
	stock: WarehouseStockItem[];
}

type SortCol = "name" | "sku" | "category" | "unit" | "quantity" | "averageCost" | "value";

/** Sort accessor per column — every column is sortable (string-locale or numeric via compareValues). */
const SORT_ACCESSOR: Record<SortCol, (i: WarehouseStockItem) => string | number> = {
	name: (i) => i.productName,
	sku: (i) => i.sku,
	category: (i) => i.categoryName ?? "",
	unit: (i) => MEASUREMENT_SHORT[i.measurement],
	quantity: (i) => i.quantity,
	averageCost: (i) => i.averageCost,
	value: (i) => i.value,
};

const ALL_CATEGORIES = "__all__";

/**
 * «Остатки» tab per the bundle: the warehouse's on-hand products with WAC and
 * stock value, searchable by name/SKU, filterable by category, sortable on every
 * column, with a served «Итого по складу» summary row.
 */
export const WarehouseStockTab: React.FC<WarehouseStockTabProps> = ({ warehouse, stock }) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState(ALL_CATEGORIES);
	const [sortCol, setSortCol] = useState<SortCol>("value");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	const categories = useMemo(() => {
		const names = new Set<string>();
		stock.forEach((item) => item.categoryName && names.add(item.categoryName));
		return [...names].sort((a, b) => a.localeCompare(b, "ru"));
	}, [stock]);

	const rows = useMemo(() => {
		const filtered = stock.filter((item) => {
			if (category !== ALL_CATEGORIES && item.categoryName !== category) {
				return false;
			}
			if (
				query.trim() &&
				!matchesSearch(item.productName, query) &&
				!matchesSearch(item.sku, query)
			) {
				return false;
			}
			return true;
		});
		const accessor = SORT_ACCESSOR[sortCol];
		const sorted = [...filtered].sort((a, b) => compareValues(accessor(a), accessor(b)));
		return sortDir === "desc" ? sorted.reverse() : sorted;
	}, [stock, query, category, sortCol, sortDir]);

	const onSort = (col: SortCol) => {
		if (col === sortCol) {
			setSortDir((d) => (d === "desc" ? "asc" : "desc"));
		} else {
			setSortCol(col);
			setSortDir("desc");
		}
	};

	const isFiltering = query.trim() !== "" || category !== ALL_CATEGORIES;

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset to the first page whenever the filters or sort change.
	useEffect(() => setPage(0), [query, category, sortCol, sortDir]);

	const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<DetailCard>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "10px",
					p: "14px 16px",
					borderBottom: 1,
					borderColor: "divider",
					flexWrap: "wrap",
				}}
			>
				<SearchInput
					value={query}
					onChange={setQuery}
					placeholder={t("warehouse.stock.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 280 } }}
				/>
				<TextField
					select
					size="small"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					sx={{
						width: 200,
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
						"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
					}}
					slotProps={{
						input: {
							startAdornment: (
								<LocalOfferOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mr: "6px" }} />
							),
						},
					}}
				>
					<MenuItem value={ALL_CATEGORIES}>{t("warehouse.stock.allCategories")}</MenuItem>
					{categories.map((name) => (
						<MenuItem key={name} value={name}>
							{name}
						</MenuItem>
					))}
				</TextField>
				<Box sx={{ flexGrow: 1 }} />
				<Typography sx={{ ...numericSx, fontSize: 12.5, color: "text.secondary" }}>
					{t("warehouse.stock.count", { value: rows.length })}
				</Typography>
			</Box>

			{rows.length === 0 ? (
				<Box
					sx={{
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "6px",
						p: "40px 24px 44px",
						textAlign: "center",
					}}
				>
					<SearchOffOutlinedIcon sx={{ fontSize: 24, color: "text.disabled", mb: "6px" }} />
					<Typography sx={{ fontSize: 14, fontWeight: 600 }}>
						{t("warehouse.stock.emptyTitle")}
					</Typography>
					<Typography
						sx={{ fontSize: 12.5, color: "text.secondary", maxWidth: 320, lineHeight: 1.5 }}
					>
						{t("warehouse.stock.emptyBody")}
					</Typography>
				</Box>
			) : (
				<>
					<Box component="table" sx={detailTableSx}>
						<thead>
							<tr>
								<DetailSortHeader
									col="name"
									label={t("warehouse.stock.product")}
									active={sortCol === "name"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="sku"
									label={t("warehouse.stock.sku")}
									active={sortCol === "sku"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="category"
									label={t("warehouse.stock.category")}
									active={sortCol === "category"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="unit"
									label={t("warehouse.stock.unit")}
									active={sortCol === "unit"}
									dir={sortDir}
									onSort={onSort}
								/>
								<DetailSortHeader
									col="quantity"
									label={t("warehouse.stock.quantity")}
									active={sortCol === "quantity"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
								<DetailSortHeader
									col="averageCost"
									label={t("warehouse.stock.wac")}
									active={sortCol === "averageCost"}
									dir={sortDir}
									onSort={onSort}
									align="right"
									tooltip={t("warehouse.stock.wacTooltip")}
								/>
								<DetailSortHeader
									col="value"
									label={t("warehouse.stock.value")}
									active={sortCol === "value"}
									dir={sortDir}
									onSort={onSort}
									align="right"
								/>
							</tr>
						</thead>
						<tbody>
							{paged.map((item) => (
								<tr key={item.productId}>
									<td>
										<Box component="span" sx={{ fontWeight: 600 }}>
											{item.productName}
										</Box>
									</td>
									<td>
										<Box
											component="span"
											sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }}
										>
											{item.sku}
										</Box>
									</td>
									<td>
										<Box component="span" sx={{ color: "text.secondary" }}>
											{item.categoryName ?? "—"}
										</Box>
									</td>
									<td>
										<Box component="span" sx={{ color: "text.secondary" }}>
											{MEASUREMENT_SHORT[item.measurement]}
										</Box>
									</td>
									<td className="r">
										<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
											{formatQuantity(item.quantity)}
										</Box>
									</td>
									<td className="r">
										<Box component="span" sx={{ ...numericSx, color: "text.secondary" }}>
											{formatCurrency(item.averageCost)}
										</Box>
									</td>
									<td className="r">
										<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
											{formatCurrency(item.value)}
										</Box>
									</td>
								</tr>
							))}
							{!isFiltering && page === lastPage && (
								<tr className="total">
									<td>{t("warehouse.stock.total")}</td>
									<td />
									<td />
									<td />
									<td className="r">
										<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
											{formatQuantity(warehouse.totalUnits)}
										</Box>
									</td>
									<td />
									<td className="r">
										<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
											{formatCurrency(warehouse.stockValue)}
										</Box>
									</td>
								</tr>
							)}
						</tbody>
					</Box>
					<TablePager
						count={rows.length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={setPage}
						onRowsPerPageChange={(value) => {
							setRowsPerPage(value);
							setPage(0);
						}}
					/>
				</>
			)}
		</DetailCard>
	);
};

export default WarehouseStockTab;
