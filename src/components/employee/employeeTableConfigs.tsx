import { translate } from "i18n/i18n";
import { Employee } from "models/employee";
import { Column } from "components/shared/DataTable/DataTable";
import { Typography } from "@mui/material";
import { JSX } from "react";

const getBalanceColor = (isActive: boolean): string => {
	if (isActive) {
		return "success.main";
	}

	return "error.main";
};

const getActiveStatus = (isActive: boolean): JSX.Element => {
	return (
		<span style={{ color: isActive ? "green" : "red", fontWeight: 500 }}>
			{isActive ? "Активен" : "Не активен"}
		</span>
	);
};

export const employeeColumns: Column<Employee>[] = [
	{
		key: "name",
		field: "fullName",
		headerName: translate("employee.fullName"),
		sortable: true,
		width: "20%",
	},
	{
		key: "role",
		field: "role",
		headerName: translate("employee.role"),
		sortable: true,
		width: "20%",
	},
	{
		key: "isActive",
		field: "isActive",
		headerName: translate("employee.isActive"),
		sortable: true,
		width: "20%",
		renderCell: (emp) => {
			const colorKey = getBalanceColor(emp.isActive);
			return <Typography sx={{ color: colorKey }}>{getActiveStatus(emp.isActive)}</Typography>;
		},
	},
];
