import React, { useEffect, useMemo } from "react";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeeSidePane from "components/employee/SidePane/EmployeeSidePane";
import EmployeeTable from "components/employee/Table/EmployeeTable";
import PayrollModal from "components/payroll/Form/PayrollModalForm";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box } from "@mui/material";

const EmployeePage: React.FC = observer(() => {
	const { employeeStore } = useStore();

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const handleFormSave = (payload: EmployeeFormPayload) =>
		employeeStore.selectedEmployee
			? employeeStore.update({ id: employeeStore.selectedEmployee.id, ...payload })
			: employeeStore.create({ ...payload });

	const handlePayrollSave = async (payload: PayrollFormPayload) => {
		if (!employeeStore.selectedEmployee) {
			return;
		}

		try {
			employeeStore.closeDialog();
		} catch (error) {
			console.error("Failed to create payroll:", error);
		}
	};

	const handleDeleteConfirmed = () => {
		if (employeeStore.selectedEmployee) {
			employeeStore.delete(employeeStore.selectedEmployee.id);
		}
	};

	const employeesCount = useMemo(() => {
		if (employeeStore.filteredEmployees === "loading") {
			return "";
		}

		return employeeStore.filteredEmployees.length.toString();
	}, [employeeStore.filteredEmployees]);

	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	return (
		<Box>
			<EmployeeHeader
				searchValue={employeeStore.searchTerm}
				selectedStatus={employeeStore.filterStatus}
				titleCount={employeesCount}
				onSearch={(value) => employeeStore.setSearch(value)}
				onStatusChange={(value) => employeeStore.setFilterStatus(value)}
				onCreate={employeeStore.openCreate}
			/>

			<EmployeeTable
				data={employeeStore.filteredEmployees}
				pagination
				onSort={employeeStore.setSort}
				onEdit={employeeStore.openEdit}
				onDelete={employeeStore.openDelete}
				onPayment={employeeStore.openPayment}
				onViewDetails={employeeStore.openDetails}
			/>

			<EmployeeFormModal
				isOpen={dialogKind === "form"}
				isSaving={employeeStore.isSaving}
				employee={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handleFormSave}
			/>

			<PayrollModal
				isOpen={dialogKind === "payment"}
				isSaving={employeeStore.isSaving}
				employee={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handlePayrollSave}
			/>

			<EmployeeSidePane
				open={dialogKind === "details"}
				employee={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onEdit={employeeStore.openEdit}
				onDelete={employeeStore.openDelete}
				onPayment={employeeStore.openPayment}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "delete"}
				title={translate("common.deleteTitle")}
				content={translate("employee.deleteConfirmation", {
					employeeName: employeeStore.selectedEmployee?.name ?? "",
				})}
				onConfirm={handleDeleteConfirmed}
				onCancel={employeeStore.closeDialog}
			/>
		</Box>
	);
});

export default EmployeePage;
