import React from "react";
import { DataTable } from "components/shared/Table/DataTable/DataTable";
import { Column, SortOrder } from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { Loadable } from "helpers/Loading";
import { Employee } from "models/employee";

import EmployeeActionMenu from "../ActionMenu/EmployeeActionMenu";
import { employeeColumns } from "./employeeTableConfig";

interface EmployeeTableProps {
	data: Loadable<Employee[]>;
	pagination: boolean;

	onSort: (field: keyof Employee, order: SortOrder) => void;
	onEdit: (employee: Employee) => void;
	onDelete: (employee: Employee) => void;
	onPayment: (employee: Employee) => void;
	onViewDetails: (employee: Employee) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
	data: rows,
	pagination,
	onSort,
	onEdit,
	onDelete,
	onPayment,
	onViewDetails,
}) => {
	const columns: Column<Employee>[] = [
		...employeeColumns,
		{
			key: "actions",
			headerName: "",
			width: 80,
			renderCell: (employee: Employee) => (
				<EmployeeActionMenu
					onPayment={() => onPayment(employee)}
					onEdit={() => onEdit(employee)}
					onDelete={() => onDelete(employee)}
				/>
			),
		},
	];

	return (
		<DataTable<Employee>
			rows={rows}
			columns={columns}
			pagination={pagination}
			onSort={onSort}
			onRowClick={onViewDetails}
		/>
	);
};

export default EmployeeTable;
