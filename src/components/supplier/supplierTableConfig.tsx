import React from "react";
import { Box, Tooltip } from "@mui/material";
import { Column } from "components/shared/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { Supplier } from "models/supplier";

/**
 * Columns for the Suppliers table:
 * - name
 * - companyName
 * - address
 * - email
 * - phoneNumbers (comma-separated)
 * - isActive (boolean with tooltip)
 */
export const supplierColumns: Column<Supplier>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("fieldName"),
		sortable: true,
		width: 200,
	},
	{
		key: "companyName",
		field: "companyName",
		headerName: translate("fieldCompanyName"),
		sortable: true,
		width: 200,
		renderCell: (s) => s.companyName ?? "—",
	},
	{
		key: "address",
		field: "address",
		headerName: translate("fieldAddress"),
		sortable: false,
		width: 250,
		renderCell: (s) => s.address ?? "—",
	},
	{
		key: "email",
		field: "email",
		headerName: translate("fieldEmail"),
		sortable: false,
		width: 200,
		renderCell: (s) => s.email ?? "—",
	},
	{
		key: "phoneNumbers",
		field: "phoneNumbers",
		headerName: translate("fieldPhoneNumbers"),
		sortable: false,
		width: 200,
		renderCell: (s) => ((s.phoneNumbers?.length ?? 0) > 0 ? s.phoneNumbers.join(", ") : "—"),
	},
	{
		key: "isActive",
		field: "isActive",
		headerName: translate("fieldIsActive"),
		sortable: true,
		width: 100,
		align: "center",
		renderCell: (s) => {
			const title = s.isActive ? translate("active") : translate("inactive");
			const color = s.isActive ? "success.main" : "error.main";
			return (
				<Tooltip title={title} arrow>
					<Box
						component="span"
						sx={{
							display: "inline-block",
							bgcolor: color,
							width: 12,
							height: 12,
							borderRadius: "50%",
						}}
					/>
				</Tooltip>
			);
		},
	},
];
