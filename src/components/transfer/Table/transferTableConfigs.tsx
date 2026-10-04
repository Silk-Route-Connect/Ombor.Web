import React from "react";
import DateCell from "components/shared/Table/cells/DateCell";
import DocNumberCell from "components/shared/Table/cells/DocNumberCell";
import MutedTextCell from "components/shared/Table/cells/MutedTextCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { TFunction } from "i18next";
import { Transfer, transferUnits } from "models/transfer";
import { transferDetailPath } from "routing/paths";

/**
 * Transfer list columns in the canonical order (conventions.md → Tables):
 * № · Дата · Откуда · Куда · Автор · Позиций · Единиц. The number links to the
 * read-only detail (`/transfers/:id`).
 */
export function buildTransferColumns(t: TFunction): Column<Transfer>[] {
	return [
		{
			key: "number",
			headerName: t("transfer.table.number"),
			width: COLUMN_WIDTH.number,
			sortValue: (tr) => tr.id,
			renderCell: (tr) => <DocNumberCell number={tr.id} to={transferDetailPath(tr.id)} />,
		},
		{
			key: "date",
			headerName: t("transfer.table.date"),
			width: COLUMN_WIDTH.dateTime,
			sortValue: (tr) => Date.parse(tr.date),
			renderCell: (tr) => <DateCell value={tr.date} />,
		},
		{
			key: "from",
			headerName: t("transfer.table.from"),
			sortValue: (tr) => tr.fromWarehouseName,
			renderCell: (tr) => <WarehouseLink id={tr.fromWarehouseId} name={tr.fromWarehouseName} />,
		},
		{
			key: "to",
			headerName: t("transfer.table.to"),
			sortValue: (tr) => tr.toWarehouseName,
			renderCell: (tr) => <WarehouseLink id={tr.toWarehouseId} name={tr.toWarehouseName} />,
		},
		{
			key: "createdBy",
			headerName: t("transfer.table.createdBy"),
			width: COLUMN_WIDTH.author,
			sortValue: (tr) => tr.createdBy,
			renderCell: (tr) => <MutedTextCell text={tr.createdBy} />,
		},
		{
			key: "positions",
			headerName: t("transfer.table.positions"),
			width: COLUMN_WIDTH.count,
			align: "right",
			sortValue: (tr) => tr.lines.length,
			renderCell: (tr) => <QuantityCell value={tr.lines.length} />,
		},
		{
			key: "units",
			headerName: t("transfer.table.units"),
			width: COLUMN_WIDTH.quantity,
			align: "right",
			sortValue: (tr) => transferUnits(tr),
			renderCell: (tr) => <QuantityCell value={transferUnits(tr)} />,
		},
	];
}
