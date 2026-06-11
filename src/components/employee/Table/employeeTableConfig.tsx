import { Column } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import i18next from "i18n/config";
import { Employee } from "models/employee";

import EmployeeStatusChip from "../Chip/EmployeeStatusChip";

export const employeeColumns: Column<Employee>[] = [
	{
		key: "name",
		field: "name",
		headerName: i18next.t("employee.name"),
		sortable: true,
		width: "25%",
	},
	{
		key: "position",
		field: "position",
		headerName: i18next.t("employee.position"),
		sortable: true,
		width: "20%",
	},
	{
		field: "contactInfo",
		key: "contactInfo",
		headerName: i18next.t("employee.contactInfo"),
		sortable: false,
		width: "20%",
		renderCell: (employee: Employee) => employee.contactInfo?.phoneNumbers[0] || "-",
	},
	{
		key: "status",
		field: "status",
		headerName: i18next.t("employee.status"),
		sortable: true,
		width: "20%",
		renderCell: (employee) => <EmployeeStatusChip status={employee.status} />,
	},
	{
		key: "dateOfEmployment",
		field: "dateOfEmployment",
		headerName: i18next.t("employee.dateOfEmployment"),
		sortable: true,
		width: "15%",
		renderCell: (employee) => new Date(employee.dateOfEmployment).toLocaleDateString(),
	},
];
