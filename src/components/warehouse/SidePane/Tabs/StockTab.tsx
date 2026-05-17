import React, { useMemo, useState } from "react";
import ProductLink from "components/product/Links/ProductLink";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Warehouse, WarehouseItem } from "models/warehouse";
import { useStore } from "stores/StoreContext";

import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Box, Chip, IconButton, TextField, Tooltip, Typography } from "@mui/material";

interface EnrichedWarehouseItem extends WarehouseItem {
	productName: string;
	productSku: string;
}

interface StockTabProps {
	warehouse: Warehouse;
	onAdjustStock: (warehouse: Warehouse) => void;
	onTransfer: (warehouse: Warehouse) => void;
}

const StockTab: React.FC<StockTabProps> = observer(({ warehouse, onAdjustStock, onTransfer }) => {
	const { productStore } = useStore();
	const [searchTerm, setSearchTerm] = useState("");

	const products = Array.isArray(productStore.allProducts) ? productStore.allProducts : [];

	const enrichedItems: EnrichedWarehouseItem[] = useMemo(() => {
		return warehouse.items.map((item) => {
			const product = products.find((p) => p.id === item.productId);
			return {
				...item,
				productName: product?.name ?? translate("common.unknown"),
				productSku: product?.sku ?? "-",
			};
		});
	}, [warehouse.items, products]);

	const filteredItems = useMemo(() => {
		if (!searchTerm.trim()) {
			return enrichedItems;
		}

		const term = searchTerm.toLowerCase();
		return enrichedItems.filter(
			(item) =>
				item.productName.toLowerCase().includes(term) ||
				item.productSku.toLowerCase().includes(term),
		);
	}, [enrichedItems, searchTerm]);

	const columns: Column<EnrichedWarehouseItem>[] = [
		{
			key: "product",
			field: "productName",
			headerName: translate("warehouse.sidePane.stock.product"),
			width: "30%",
			renderCell: (item) => <ProductLink id={item.productId} name={item.productName} />,
		},
		{
			key: "sku",
			field: "productSku",
			headerName: translate("warehouse.sidePane.stock.sku"),
			width: "20%",
			renderCell: (item) => (
				<Typography variant="body2" color="text.secondary">
					{item.productSku}
				</Typography>
			),
		},
		{
			key: "quantity",
			field: "quantity",
			headerName: translate("warehouse.sidePane.stock.stock"),
			width: "15%",
			align: "right",
			renderCell: (item) => {
				const isLowStock = item.quantity <= item.lowStockThreshold;
				return (
					<Typography
						variant="body2"
						fontWeight={isLowStock ? 600 : 400}
						color={isLowStock ? "error.main" : "text.primary"}
					>
						{item.quantity}
					</Typography>
				);
			},
		},
		{
			key: "threshold",
			field: "lowStockThreshold",
			headerName: translate("warehouse.sidePane.stock.threshold"),
			width: "15%",
			align: "right",
			renderCell: (item) => (
				<Typography variant="body2" color="text.secondary">
					{item.lowStockThreshold}
				</Typography>
			),
		},
		{
			key: "status",
			headerName: translate("warehouse.sidePane.stock.status"),
			width: "20%",
			align: "center",
			renderCell: (item) => {
				const isLowStock = item.quantity <= item.lowStockThreshold;
				return isLowStock ? (
					<Tooltip title={translate("warehouse.sidePane.stock.lowStockWarning")}>
						<Chip
							icon={<WarningAmberIcon />}
							label={translate("warehouse.sidePane.stock.lowStock")}
							color="error"
							size="small"
							variant="outlined"
						/>
					</Tooltip>
				) : (
					<Chip
						label={translate("warehouse.sidePane.stock.ok")}
						color="success"
						size="small"
						variant="outlined"
					/>
				);
			},
		},
	];

	return (
		<Box sx={{ p: 2 }}>
			<Box sx={{ display: "flex", gap: 1, mb: 2 }}>
				<TextField
					label={translate("warehouse.sidePane.stock.search")}
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					size="small"
					fullWidth
					placeholder={translate("warehouse.sidePane.stock.searchPlaceholder")}
				/>
				<Tooltip title={translate("warehouse.adjustStock.button")}>
					<IconButton color="primary" onClick={() => onAdjustStock(warehouse)} size="medium">
						<TuneIcon />
					</IconButton>
				</Tooltip>
				<Tooltip title={translate("warehouse.transferStock.button")}>
					<IconButton color="primary" onClick={() => onTransfer(warehouse)} size="medium">
						<SwapHorizIcon />
					</IconButton>
				</Tooltip>
			</Box>

			<DataTable<EnrichedWarehouseItem> rows={filteredItems} columns={columns} />
		</Box>
	);
});

export default StockTab;
