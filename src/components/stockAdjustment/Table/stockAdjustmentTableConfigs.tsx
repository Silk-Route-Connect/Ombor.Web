import React from "react";
import ProductLink from "components/product/Links/ProductLink";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import EntityCell from "components/shared/Table/cells/EntityCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { TFunction } from "i18next";
import { StockAdjustment } from "models/stockAdjustment";
import { stockAdjustmentDetailPath } from "routing/paths";
import { adjustmentValue } from "utils/listTotals";

export interface StockAdjustmentColumnOptions {
	/**
	 * «Автор» only on wide screens (xl): below it the nine columns cannot fit a
	 * 1366–1440px laptop without sideways scrolling. The detail and the CSV keep it.
	 */
	showAuthor: boolean;
}

/**
 * Stock-adjustment history columns in the canonical order (conventions.md →
 * Tables): № · Дата · Товар · Склад · Направление · Причина · Автор ·
 * Количество (signed by direction) · Сумма (the served value at the average
 * cost — written off on a Списание, restored on a Приход товара). The number
 * links to the read-only detail (`/adjustments/:id`).
 */
export function buildStockAdjustmentColumns(
	t: TFunction,
	{ showAuthor }: StockAdjustmentColumnOptions,
): Column<StockAdjustment>[] {
	const columns: Column<StockAdjustment>[] = [
		{
			key: "number",
			headerName: t("adjustment.table.number"),
			width: COLUMN_WIDTH.number,
			sortValue: (a) => a.id,
			renderCell: (a) => <DocNumberCell number={a.id} to={stockAdjustmentDetailPath(a.id)} />,
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
			renderCell: (a) => (
				<EntityCell>
					<ProductLink id={a.productId} name={a.productName} />
				</EntityCell>
			),
		},
		{
			key: "warehouse",
			headerName: t("adjustment.table.warehouse"),
			sortValue: (a) => a.warehouseName,
			renderCell: (a) => (
				<WarehouseLink id={a.warehouseId} name={a.warehouseName} variant="secondary" />
			),
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
		{
			key: "value",
			headerName: t("adjustment.table.value"),
			headerTooltip: t("adjustment.table.valueHint"),
			width: COLUMN_WIDTH.money,
			align: "right",
			sortValue: (a) => adjustmentValue(a) ?? -1,
			renderCell: (a) => <MoneyCell value={adjustmentValue(a)} main />,
		},
	];
	return showAuthor ? columns : columns.filter((col) => col.key !== "createdBy");
}
