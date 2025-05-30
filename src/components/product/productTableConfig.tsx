// src/components/product/productTableConfig.tsx
import React from "react";
import { Box, Tooltip } from "@mui/material";
import { Column } from "components/shared/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Product } from "models/product";

/**
 * Columns for the Products table:
 * - name, sku, category
 * - sale price formatted
 * - stock: numeric with tooltip+color
 * - expiration: date with tooltip+color
 */
export const productColumns: Column<Product>[] = [
	{
		key: "sku",
		field: "sku",
		headerName: "Артикул",
		sortable: true,
		width: 100,
	},
	{
		key: "name",
		field: "name",
		headerName: "Название",
		sortable: true,
		width: 200,
	},
	{
		key: "category",
		field: "categoryName",
		headerName: "Категория",
		sortable: true,
		width: 150,
	},
	{
		key: "type",
		field: "type",
		headerName: "Тип",
		sortable: true,
		width: 100,
		renderCell: (p) => <Box component="span">{translate(`type.${p.type}`)}</Box>,
	},
	{
		key: "salePrice",
		field: "salePrice",
		headerName: "Прод. цена",
		align: "right",
		sortable: true,
		width: 120,
		renderCell: (p) => <Box component="span">{p.salePrice.toLocaleString()}</Box>,
	},
	{
		key: "supplyPrice",
		field: "supplyPrice",
		headerName: "Зак. цена",
		align: "right",
		sortable: true,
		width: 120,
		renderCell: (p) => <Box component="span">{p.supplyPrice.toLocaleString()}</Box>,
	},
	{
		key: "retailPrice",
		field: "retailPrice",
		headerName: "Розн. цена",
		align: "right",
		sortable: true,
		width: 120,
		renderCell: (p) => <Box component="span">{p.retailPrice.toLocaleString()}</Box>,
	},
	{
		key: "stock",
		field: "quantityInStock",
		headerName: "Остаток",
		sortable: true,
		align: "right",
		width: 100,
		renderCell: (p) => {
			const title = p.isLowStock ? "Low stock" : "In stock";
			const color = p.isLowStock ? "warning.main" : "text.primary";
			return (
				<Tooltip title={title} arrow>
					<Box component="span" sx={{ color }}>
						{p.quantityInStock}
					</Box>
				</Tooltip>
			);
		},
	},
];
