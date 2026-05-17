import React from "react";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { StockTransfer } from "models/stockTransfer";
import { formatDateTime } from "utils/dateUtils";
import { DEFAULT_NOTES_TRUNCATE_LENGTH, formatNotes } from "utils/stringUtils";

import { Chip, Tooltip, Typography } from "@mui/material";

export const stockTransferTableColumns: Column<StockTransfer>[] = [
	{
		key: "createdAt",
		field: "createdAt",
		headerName: translate("stockTransfer.date"),
		sortable: true,
		width: "15%",
		renderCell: (transfer) => formatDateTime(transfer.createdAt),
	},
	{
		key: "fromWarehouse",
		field: "fromWarehouseName",
		headerName: translate("stockTransfer.from"),
		sortable: true,
		width: "18%",
	},
	{
		key: "toWarehouse",
		field: "toWarehouseName",
		headerName: translate("stockTransfer.to"),
		sortable: true,
		width: "18%",
	},
	{
		key: "productsCount",
		field: "productsCount",
		headerName: translate("stockTransfer.products"),
		sortable: true,
		width: "10%",
		align: "center",
		renderCell: (transfer) => <Chip label={transfer.productsCount} color="primary" size="small" />,
	},
	{
		key: "totalQuantity",
		field: "totalQuantity",
		headerName: translate("stockTransfer.totalQuantity"),
		sortable: true,
		width: "10%",
		align: "right",
	},
	{
		key: "userName",
		field: "userName",
		headerName: translate("stockTransfer.user"),
		sortable: true,
		width: "12%",
	},
	{
		key: "notes",
		field: "notes",
		headerName: translate("stockTransfer.notes"),
		width: "17%",
		renderCell: (transfer) => {
			const formattedNotes = formatNotes(transfer.notes);
			const hasTooltip = transfer.notes && transfer.notes.length > DEFAULT_NOTES_TRUNCATE_LENGTH;

			return hasTooltip ? (
				<Tooltip title={transfer.notes} arrow>
					<Typography variant="body2" sx={{ cursor: "help" }}>
						{formattedNotes}
					</Typography>
				</Tooltip>
			) : (
				<Typography variant="body2">{formattedNotes}</Typography>
			);
		},
	},
];
