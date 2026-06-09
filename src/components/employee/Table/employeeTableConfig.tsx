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
		headerName: translate("employee.col.employee"),
		sortable: true,
		width: "26%",
		renderCell: (employee) => (
			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
				<InitialsAvatar name={employee.name} />
				<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
					{employee.name}
				</Typography>
			</Box>
		),
	},
	{
		key: "position",
		field: "position",
		headerName: translate("employee.position"),
		sortable: true,
		width: "24%",
		renderCell: (employee) => (
			<Typography variant="body2" noWrap>
				{employee.position}
			</Typography>
		),
	},
	{
		key: "salary",
		field: "salary",
		headerName: translate("employee.salary"),
		sortable: true,
		align: "right",
		width: "18%",
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
		key: "status",
		field: "status",
		headerName: translate("employee.status"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => <EmployeeStatusChip status={employee.status} />,
	},
	{
		key: "dateOfEmployment",
		field: "dateOfEmployment",
		headerName: translate("employee.dateOfEmployment"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => (
			<Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
				{new Date(employee.dateOfEmployment).toLocaleDateString("ru-RU")}
			</Typography>
		),
	},
];
