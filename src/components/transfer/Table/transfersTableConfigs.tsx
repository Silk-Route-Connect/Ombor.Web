import { Column } from "components/shared/Table/DataTable/DataTable";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { TFunction } from "i18next";
import { Transfer, transferUnits } from "models/transfer";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";

import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

const stop = (e: React.MouseEvent) => e.stopPropagation();

const WarehouseCell: React.FC<{ id: number; name: string; accent?: boolean }> = ({
	id,
	name,
	accent,
}) => (
	<Box
		component="span"
		sx={{
			display: "inline-flex",
			alignItems: "center",
			gap: "7px",
			whiteSpace: "nowrap",
			fontWeight: accent ? 600 : 400,
		}}
		onClick={stop}
	>
		<WarehouseOutlinedIcon
			sx={{ fontSize: 15, color: accent ? "primary.main" : "text.disabled" }}
		/>
		<WarehouseLink id={id} name={name} />
	</Box>
);

/**
 * Columns for the transfers list per the bundle: date, route (from → to with the
 * destination accented), position + unit counts, author, and a chevron affordance
 * (the row opens the read-only detail modal). Built at render time so labels
 * resolve through the live `t` (docs/conventions.md).
 */
export function buildTransferColumns(t: TFunction): Column<Transfer>[] {
	return [
		{
			key: "date",
			field: "date",
			headerName: t("transfer.table.date"),
			width: "16%",
			renderCell: (transfer) => (
				<Typography
					component="span"
					sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
				>
					{formatDateTime(transfer.date)}
				</Typography>
			),
		},
		{
			key: "from",
			headerName: t("transfer.table.from"),
			width: "22%",
			sortValue: (transfer) => transfer.fromWarehouseName,
			renderCell: (transfer) => (
				<WarehouseCell id={transfer.fromWarehouseId} name={transfer.fromWarehouseName} />
			),
		},
		{
			key: "to",
			headerName: t("transfer.table.to"),
			width: "22%",
			sortValue: (transfer) => transfer.toWarehouseName,
			renderCell: (transfer) => (
				<WarehouseCell id={transfer.toWarehouseId} name={transfer.toWarehouseName} accent />
			),
		},
		{
			key: "positions",
			headerName: t("transfer.table.positions"),
			width: "10%",
			align: "right",
			sortValue: (transfer) => transfer.lines.length,
			renderCell: (transfer) => (
				<Typography component="span" sx={{ ...numericSx, color: designTokens.gray700 }}>
					{transfer.lines.length}
				</Typography>
			),
		},
		{
			key: "units",
			headerName: t("transfer.table.units"),
			width: "11%",
			align: "right",
			sortValue: (transfer) => transferUnits(transfer),
			renderCell: (transfer) => (
				<Typography component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{formatQuantity(transferUnits(transfer))}
				</Typography>
			),
		},
		{
			key: "createdBy",
			headerName: t("transfer.table.createdBy"),
			width: "15%",
			sortValue: (transfer) => transfer.createdBy,
			renderCell: (transfer) => (
				<Typography component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
					{transfer.createdBy}
				</Typography>
			),
		},
	];
}
