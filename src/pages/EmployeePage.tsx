import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeesTable from "components/employee/Table/EmployeesTable";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { readyOr } from "helpers/Loading";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { employeeDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import { Box } from "@mui/material";

const EmployeePage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { employeeStore, payrollStore } = useStore();
	const tableOrder = useTableOrder<Employee>();

	useEffect(() => {
		void employeeStore.getAll({ quiet: true });
	}, [employeeStore]);

	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	const handleFormSave = (payload: EmployeeFormPayload) =>
		employeeStore.selectedEmployee
			? employeeStore.update({ id: employeeStore.selectedEmployee.id, ...payload })
			: employeeStore.create({ ...payload });

	const handlePayrollSave = async (payload: PayrollFormPayload) => {
		const ok = await payrollStore.create(payload);
		if (ok) {
			employeeStore.markPaid(payload.employeeId);
			employeeStore.closeDialog();
		}
	};

	const handleExport = (): void => {
		const rows = readyOr(employeeStore.filteredEmployees, []);
		const columns: CsvColumn<Employee>[] = [
			{ header: t("employee.name"), value: (e) => e.name },
			{ header: t("employee.status"), value: (e) => t(`employee.status.${e.status}`) },
			{ header: t("employee.position"), value: (e) => e.position },
			{ header: t("employee.dateOfEmployment"), value: (e) => formatDate(e.dateOfEmployment) },
			{ header: t("employee.salary"), value: (e) => e.salary },
		];
		exportToCsv(`employees_${csvDateStamp()}`, columns, tableOrder.apply(rows));
	};

	const all = readyOr(employeeStore.allEmployees, []);
	const isFiltering =
		employeeStore.searchTerm.trim().length > 0 || employeeStore.filterStatus !== null;

	return (
		<Box>
			<EmployeeHeader
				searchValue={employeeStore.searchTerm}
				selectedStatus={employeeStore.filterStatus}
				onSearch={employeeStore.setSearch}
				onStatusChange={employeeStore.setFilterStatus}
				onCreate={employeeStore.openCreate}
				onExport={handleExport}
				exportCount={readyOr(employeeStore.filteredEmployees, []).length}
			/>

			<EmployeesTable
				exportOrder={tableOrder}
				onRetry={() => void employeeStore.getAll({ quiet: true })}
				errorTitle={t("employees.error.getAll")}
				rows={employeeStore.filteredEmployees}
				isFiltering={isFiltering && all.length > 0}
				onOpen={(employee) => navigate(employeeDetailPath(employee.id))}
				onCreate={employeeStore.openCreate}
				onPay={employeeStore.openPayment}
				onEdit={employeeStore.openEdit}
				onTerminate={employeeStore.openTerminate}
				onRestore={employeeStore.openRestore}
				onDelete={employeeStore.openDelete}
			/>

			<EmployeeFormModal
				isOpen={dialogKind === "form"}
				isSaving={employeeStore.isSaving}
				employee={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handleFormSave}
			/>

			<PayrollFormModal
				isOpen={dialogKind === "payment"}
				isSaving={payrollStore.isSaving}
				mode={employeeStore.selectedEmployee}
				onClose={employeeStore.closeDialog}
				onSave={handlePayrollSave}
			/>

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeePage;
