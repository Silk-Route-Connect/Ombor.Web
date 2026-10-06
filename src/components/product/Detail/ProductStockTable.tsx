import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import DetailTable from "components/shared/Detail/DetailTable";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Product, ProductWarehouseItem } from "models/product";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { stockValue } from "utils/productUtils";

import { Box } from "@mui/material";

type StockRow = ProductWarehouseItem & { id: number };

/**
 * The product's stock per warehouse: quantity with its unit, average cost
 * (with the pattern-16 hint) and stock value, plus the served «Итого» band.
 * Stock figures are never coloured — the card header flags zero stock.
 */
export const ProductStockTable: React.FC<{ product: Product }> = ({ product }) => {
	const { t } = useTranslation();
	const rows = useMemo<StockRow[]>(
		() => product.warehouseItems.map((item) => ({ ...item, id: item.warehouseId })),
		[product.warehouseItems],
	);

	const columns = useMemo<Column<StockRow>[]>(
		() => [
			{
				key: "warehouse",
				headerName: t("product.detail.table.warehouse"),
				sortValue: (i) => i.warehouseName,
				renderCell: (i) => <WarehouseLink id={i.warehouseId} name={i.warehouseName} />,
			},
			{
				key: "quantity",
				headerName: t("product.table.stock"),
				align: "right",
				sortValue: (i) => i.quantity,
				renderCell: (i) => <QuantityCell value={i.quantity} measurement={product.measurement} />,
			},
			{
				key: "wac",
				headerName: t("product.detail.table.wac"),
				headerTooltip: t("common.hint.wac"),
				align: "right",
				sortValue: (i) => (i.quantity === 0 ? null : i.averageCost),
				renderCell: (i) => <MoneyCell value={i.quantity === 0 ? null : i.averageCost} />,
			},
			{
				key: "value",
				headerName: t("product.detail.table.value"),
				align: "right",
				sortValue: (i) => i.quantity * i.averageCost,
				renderCell: (i) => <MoneyCell value={i.quantity * i.averageCost} main />,
			},
		],
		[t, product.measurement],
	);

	return (
		<DetailTable<StockRow>
			rows={rows}
			columns={columns}
			defaultSort={{ key: "warehouse", order: "asc" }}
			footer={
				<tr className="total">
					<td>{t("product.detail.table.total")}</td>
					<Box component="td" className="r" sx={numericSx}>
						<QuantityCell value={product.totalStock} measurement={product.measurement} />
					</Box>
					<Box component="td" className="r" sx={numericSx}>
						{product.averageCost != null ? formatCurrency(product.averageCost) : "—"}
					</Box>
					<Box component="td" className="r" sx={numericSx}>
						{formatCurrency(stockValue(product))}
					</Box>
				</tr>
			}
		/>
	);
};

export default ProductStockTable;
