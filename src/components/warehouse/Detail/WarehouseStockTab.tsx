import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { detailTableSx } from "components/product/Detail/detailTableSx";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import TablePager from "components/shared/Table/TablePager";
import { Warehouse, WarehouseStockItem } from "models/warehouse";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";
import { matchesSearch } from "utils/stringUtils";

import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";

interface WarehouseStockTabProps {
	warehouse: Warehouse;
	stock: WarehouseStockItem[];
}

type SortCol = "name" | "quantity" | "averageCost" | "value";
type SortState = { col: SortCol; dir: "asc" | "desc" };

const ALL_CATEGORIES = "__all__";

const SortableHeader: React.FC<{
	col: SortCol;
	label: string;
	sort: SortState;
	onSort: (col: SortCol) => void;
	align?: "left" | "right";
}> = ({ col, label, sort, onSort, align = "left" }) => {
	const active = sort.col === col;
	return (
		<Box
			component="th"
			className={align === "right" ? "r" : undefined}
			onClick={() => onSort(col)}
			sx={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
		>
			<Box
				component="span"
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "4px",
					color: active ? "primary.main" : "inherit",
				}}
			>
				{label}
				{active &&
					(sort.dir === "asc" ? (
						<ArrowUpwardIcon sx={{ fontSize: 13 }} />
					) : (
						<ArrowDownwardIcon sx={{ fontSize: 13 }} />
					))}
			</Box>
		</Box>
	);
};

/**
 * «Остатки» tab per the bundle: the warehouse's on-hand products with WAC and
 * stock value, searchable by name/SKU, filterable by category, sortable, with a
 * served «Итого по складу» summary row.
 */
export const WarehouseStockTab: React.FC<WarehouseStockTabProps> = ({ warehouse, stock }) => {
	const { t } = useTranslation();
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState(ALL_CATEGORIES);
	const [sort, setSort] = useState<SortState>({ col: "value", dir: "desc" });

	const categories = useMemo(() => {
		const names = new Set<string>();
		stock.forEach((item) => item.categoryName && names.add(item.categoryName));
		return [...names].sort((a, b) => a.localeCompare(b, "ru"));
	}, [stock]);

	const rows = useMemo(() => {
		const dir = sort.dir === "asc" ? 1 : -1;
		return stock
			.filter((item) => {
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
			})
			.sort((a, b) => {
				if (sort.col === "name") {
					return a.productName.localeCompare(b.productName, "ru") * dir;
				}
				return (a[sort.col] - b[sort.col]) * dir;
			});
	}, [stock, query, category, sort]);

	const onSort = (col: SortCol) =>
		setSort((prev) => ({ col, dir: prev.col === col && prev.dir === "desc" ? "asc" : "desc" }));

	const isFiltering = query.trim() !== "" || category !== ALL_CATEGORIES;

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

	// Reset to the first page whenever the filters or sort change.
	useEffect(() => setPage(0), [query, category, sort]);

	const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
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
								<SortableHeader
									col="name"
									label={t("warehouse.stock.product")}
									sort={sort}
									onSort={onSort}
								/>
								<Box component="th">{t("warehouse.stock.sku")}</Box>
								<Box component="th">{t("warehouse.stock.category")}</Box>
								<Box component="th">{t("warehouse.stock.unit")}</Box>
								<SortableHeader
									col="quantity"
									label={t("warehouse.stock.quantity")}
									sort={sort}
									onSort={onSort}
									align="right"
								/>
								<SortableHeader
									col="averageCost"
									label={t("warehouse.stock.wac")}
									sort={sort}
									onSort={onSort}
									align="right"
								/>
								<SortableHeader
									col="value"
									label={t("warehouse.stock.value")}
									sort={sort}
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
		</Paper>
	);
};

export default WarehouseStockTab;
