import React from "react";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Warehouse } from "models/warehouse";
import { formatNotes } from "utils/stringUtils";

import { Chip } from "@mui/material";

export const warehouseTableColumns: Column<Warehouse>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("warehouse.name"),
		sortable: true,
		width: "40%",
	},
	{
		key: "location",
		field: "location",
		headerName: translate("warehouse.location"),
		sortable: true,
		width: "40%",
		renderCell: (warehouse) => formatNotes(warehouse.location),
	},
	{
		key: "isActive",
		field: "isActive",
		headerName: translate("warehouse.status"),
		sortable: true,
		width: "20%",
		renderCell: (warehouse) => (
			<Chip
				label={translate(
					warehouse.isActive ? "warehouse.status.active" : "warehouse.status.inactive",
				)}
				color={warehouse.isActive ? "success" : "default"}
				size="small"
			/>
		),
	},
];
