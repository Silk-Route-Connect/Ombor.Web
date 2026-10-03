import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { TFunction } from "i18next";
import { StockAdjustment } from "models/stockAdjustment";

/**
 * Stock-adjustment history columns in the canonical order (conventions.md →
 * Tables): № · Дата · Товар · Склад · Направление · Причина · Создал ·
 * Количество (signed by direction). The number opens the read-only detail.
 */
export function buildStockAdjustmentColumns(
	t: TFunction,
	onOpen: (adjustment: StockAdjustment) => void,
): Column<StockAdjustment>[] {
	return [
		{
			key: "number",
			headerName: t("adjustment.table.number"),
			width: COLUMN_WIDTH.number,
			sortValue: (a) => a.id,
			renderCell: (a) => <DocNumberCell number={a.id} onOpen={() => onOpen(a)} />,
		},
		{
			key: "date",
			headerName: t("adjustment.table.date"),
			width: COLUMN_WIDTH.dateTime,
			sortValue: (a) => Date.parse(a.date),
			renderCell: (a) => <DateCell value={a.date} />,
		},
		{
			key: "product",
			headerName: t("adjustment.table.product"),
			sortValue: (a) => a.productName,
			renderCell: (a) => <ProductLink id={a.productId} name={a.productName} />,
		},
		{
			key: "warehouse",
			headerName: t("adjustment.table.warehouse"),
			sortValue: (a) => a.warehouseName,
			renderCell: (a) => <WarehouseLink id={a.warehouseId} name={a.warehouseName} />,
		},
		{
			key: "direction",
			headerName: t("adjustment.table.direction"),
			width: COLUMN_WIDTH.chip,
			sortValue: (a) => t(`adjustment.direction.${a.direction}`),
			renderCell: (a) => <DirectionChip direction={a.direction} />,
		},
		{
			key: "reason",
			headerName: t("adjustment.table.reason"),
			sortValue: (a) => t(`adjustment.reason.${a.reason}`),
			renderCell: (a) => t(`adjustment.reason.${a.reason}`),
		},
		{
			key: "createdBy",
			headerName: t("adjustment.table.createdBy"),
			width: COLUMN_WIDTH.author,
			sortValue: (a) => a.createdBy,
			renderCell: (a) => <MutedTextCell text={a.createdBy} />,
		},
		{
			key: "quantity",
			headerName: t("adjustment.table.quantity"),
			width: COLUMN_WIDTH.quantity,
			align: "right",
			sortValue: (a) => (a.direction === "Decrease" ? -a.quantity : a.quantity),
			renderCell: (a) => (
				<QuantityCell
					value={a.quantity}
					measurement={a.measurement}
					direction={a.direction === "Decrease" ? "out" : "in"}
				/>
			),
		},
	];
}
