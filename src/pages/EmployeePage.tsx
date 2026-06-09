import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeeTable from "components/employee/Table/EmployeeTable";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box } from "@mui/material";

const EmployeePage: React.FC = observer(() => {
	const { employeeStore } = useStore();
	const navigate = useNavigate();

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const employees = employeeStore.filteredEmployees;

	return (
		<Box>
			<EmployeeHeader
				searchValue={employeeStore.searchTerm}
				selectedStatus={employeeStore.filterStatus}
				onSearch={(value) => employeeStore.setSearch(value)}
				onStatusChange={(value) => employeeStore.setFilterStatus(value)}
				onCreate={employeeStore.openCreate}
			/>

			<EmployeeTable
				data={employees}
				pagination
				onSort={employeeStore.setSort}
				onEdit={employeeStore.openEdit}
				onDelete={employeeStore.openDelete}
				onPayment={employeeStore.openPayment}
				onViewDetails={(employee) => navigate(`/employees/${employee.id}`)}
			/>

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeePage;
