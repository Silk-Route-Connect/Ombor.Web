import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { translate } from "i18n/i18n";
import { Employee } from "models/employee";

import EmployeeStatusChip from "../Chip/EmployeeStatusChip";

export const employeeColumns: Column<Employee>[] = [
	{
		key: "fullName",
		field: "fullName",
		headerName: translate("employee.fullName"),
		sortable: true,
		width: "25%",
	},
	{
		key: "position",
		field: "position",
		headerName: translate("employee.position"),
		sortable: true,
		width: "20%",
	},
	{
		field: "contactInfo",
		key: "contactInfo",
		headerName: translate("employee.contactInfo"),
		sortable: false,
		width: "20%",
		renderCell: (employee: Employee) => employee.contactInfo?.phoneNumbers[0] || "-",
	},
	{
		key: "status",
		field: "status",
		headerName: translate("employee.status"),
		sortable: true,
		width: "20%",
		renderCell: (employee) => <EmployeeStatusChip status={employee.status} />,
	},
	{
		key: "dateOfEmployment",
		field: "dateOfEmployment",
		headerName: translate("employee.dateOfEmployment"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => new Date(employee.dateOfEmployment).toLocaleDateString(),
	},
];
