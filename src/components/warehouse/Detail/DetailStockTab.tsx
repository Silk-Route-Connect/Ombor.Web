import React, { useMemo, useState } from "react";
import ProductLink from "components/product/Links/ProductLink";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Measurement } from "models/product";
import { Warehouse, WarehouseItem } from "models/warehouse";
import { useStore } from "stores/StoreContext";

import SearchIcon from "@mui/icons-material/Search";
import { Box, Chip, InputAdornment, MenuItem, TextField, Typography } from "@mui/material";

// Display abbreviations for units of measurement.
const UNIT_LABEL: Record<Measurement, string> = {
	Unit: "шт",
	Gram: "г",
	Kilogram: "кг",
	Liter: "л",
	None: "—",
};

interface EnrichedItem extends WarehouseItem {
	productName: string;
	productSku: string;
	categoryName: string;
	unit: string;
}

const ALL_CATEGORIES = "__all__";

const DetailStockTab: React.FC<{ warehouse: Warehouse }> = observer(({ warehouse }) => {
	const { productStore } = useStore();
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>(ALL_CATEGORIES);

	const enriched: EnrichedItem[] = useMemo(() => {
		const products = Array.isArray(productStore.allProducts) ? productStore.allProducts : [];
		return warehouse.items.map((item) => {
			const product = products.find((p) => p.id === item.productId);
			return {
				...item,
				productName: product?.name ?? translate("common.unknown"),
				productSku: product?.sku ?? "—",
				categoryName: product?.categoryName ?? "",
				unit: product ? UNIT_LABEL[product.measurement] : "—",
			};
		});
	}, [warehouse.items, productStore.allProducts]);

	const categories = useMemo(
		() => Array.from(new Set(enriched.map((i) => i.categoryName).filter(Boolean))).sort(),
		[enriched],
	);

	const rows = useMemo(() => {
		const term = search.trim().toLowerCase();
		return enriched.filter((item) => {
			if (category !== ALL_CATEGORIES && item.categoryName !== category) {
				return false;
			}
			if (term && !`${item.productName} ${item.productSku}`.toLowerCase().includes(term)) {
				return false;
			}
			return true;
		});
	}, [enriched, search, category]);

	const dash = (
		<Typography component="span" variant="body2" sx={{ color: "text.disabled" }}>
			—
		</Typography>
	);

	const columns: Column<EnrichedItem>[] = [
		{
			key: "product",
			headerName: translate("warehouse.detail.stock.col.product"),
			renderCell: (item) => <ProductLink id={item.productId} name={item.productName} />,
		},
		{
			key: "sku",
			headerName: translate("warehouse.detail.stock.col.sku"),
			renderCell: (item) => (
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{item.productSku}
				</Typography>
			),
		},
		{
			key: "category",
			headerName: translate("warehouse.detail.stock.col.category"),
			renderCell: (item) =>
				item.categoryName ? (
					<Chip
						label={item.categoryName}
						size="small"
						sx={{ bgcolor: "grey.100", color: "text.secondary" }}
					/>
				) : (
					dash
				),
		},
		{
			key: "quantity",
			field: "quantity",
			headerName: translate("warehouse.detail.stock.col.quantity"),
			align: "right",
			renderCell: (item) => (
				<Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
					{item.quantity.toLocaleString("ru-RU")}
				</Typography>
			),
		},
		{
			key: "unit",
			headerName: translate("warehouse.detail.stock.col.unit"),
			renderCell: (item) => (
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{item.unit}
				</Typography>
			),
		},
		{
			key: "cost",
			headerName: translate("warehouse.detail.stock.col.cost"),
			align: "right",
			renderCell: () => dash,
		},
		{
			key: "total",
			headerName: translate("warehouse.detail.stock.col.total"),
			align: "right",
			renderCell: () => dash,
		},
	];

	return (
		<Box>
			<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
				<TextField
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					size="small"
					placeholder={translate("warehouse.detail.stock.searchPlaceholder")}
					sx={{ minWidth: 320, flex: "0 1 320px" }}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								<SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
							</InputAdornment>
						),
					}}
				/>
				<TextField
					select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					size="small"
					sx={{ minWidth: 200 }}
				>
					<MenuItem value={ALL_CATEGORIES}>{translate("warehouse.detail.allCategories")}</MenuItem>
					{categories.map((c) => (
						<MenuItem key={c} value={c}>
							{c}
						</MenuItem>
					))}
				</TextField>
			</Box>

			<DataTable<EnrichedItem> rows={rows} columns={columns} pagination />
		</Box>
	);
});

export default DetailStockTab;
