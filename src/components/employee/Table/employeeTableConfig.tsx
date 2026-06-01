import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { formatMoney } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

import EmployeeStatusChip from "../Chip/EmployeeStatusChip";

export const employeeColumns: Column<Employee>[] = [
	{
		key: "name",
		field: "name",
		headerName: translate("employee.name"),
		sortable: true,
		width: "30%",
		renderCell: (employee) => (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
				<InitialsAvatar name={employee.name} />
				<Box sx={{ minWidth: 0 }}>
					<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
						{employee.name}
					</Typography>
					<Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
						{employee.position}
					</Typography>
				</Box>
			</Box>
		),
	},
	{
		key: "status",
		field: "status",
		headerName: translate("employee.status"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => <EmployeeStatusChip status={employee.status} />,
	},
	{
		key: "salary",
		field: "salary",
		headerName: translate("employee.salary"),
		sortable: true,
		align: "right",
		width: "20%",
		renderCell: (employee) => (
			<Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
				{formatMoney(employee.salary)}
				<Typography component="span" sx={{ ml: 0.5, color: "text.disabled", fontSize: "0.75rem" }}>
					UZS
				</Typography>
			</Typography>
		),
	},
	{
		key: "dateOfEmployment",
		field: "dateOfEmployment",
		headerName: translate("employee.dateOfEmployment"),
		sortable: true,
		width: "17%",
		renderCell: (employee) => new Date(employee.dateOfEmployment).toLocaleDateString(),
	},
	{
		key: "contactInfo",
		field: "contactInfo",
		headerName: translate("employee.phoneNumber"),
		sortable: false,
		width: "18%",
		renderCell: (employee) => employee.contactInfo?.phoneNumbers[0] || translate("common.dash"),
	},
];
