import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import EmployeeHeader from "components/employee/Header/EmployeeHeader";
import EmployeesTable from "components/employee/Table/EmployeesTable";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { employeeDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { CsvColumn, csvDateStamp, exportToCsv } from "utils/exportToCsv";

import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { Box } from "@mui/material";

const EmployeePage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { employeeStore, payrollStore } = useStore();

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	const handleFormSave = (payload: EmployeeFormPayload) =>
		employeeStore.selectedEmployee
			? employeeStore.update({ id: employeeStore.selectedEmployee.id, ...payload })
			: employeeStore.create({ ...payload });

	const handlePayrollSave = async (payload: PayrollFormPayload) => {
		await payrollStore.create(payload);
		employeeStore.closeDialog();
	};

	const handleExport = (): void => {
		const rows =
			employeeStore.filteredEmployees === "loading" ? [] : employeeStore.filteredEmployees;
		const columns: CsvColumn<Employee>[] = [
			{ header: t("employee.name"), value: (e) => e.name },
			{ header: t("employee.position"), value: (e) => e.position },
			{ header: t("employee.salary"), value: (e) => e.salary },
			{ header: t("employee.status"), value: (e) => t(`employee.status.${e.status}`) },
			{ header: t("employee.dateOfEmployment"), value: (e) => formatDate(e.dateOfEmployment) },
		];
		exportToCsv(`employees_${csvDateStamp()}`, columns, rows);
	};

	const all = employeeStore.allEmployees === "loading" ? [] : employeeStore.allEmployees;
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
			/>

			<EmployeesTable
				rows={employeeStore.filteredEmployees}
				isFiltering={isFiltering && all.length > 0}
				onOpen={(employee) => navigate(employeeDetailPath(employee.id))}
				onCreate={employeeStore.openCreate}
				onPay={employeeStore.openPayment}
				onEdit={employeeStore.openEdit}
				onTerminate={employeeStore.openTerminate}
				onRestore={employeeStore.openRestore}
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

			<ConfirmDialog
				isOpen={dialogKind === "terminate"}
				icon={<PersonOffOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("employee.terminate.title", {
					name: dialogKind === "terminate" ? dialogMode.employee.name : "",
				})}
				content={t("employee.terminate.body")}
				confirmLabel={t("employee.action.terminate")}
				cancelLabel={t("common.cancel")}
				confirmVariant="danger"
				onCancel={employeeStore.closeDialog}
				onConfirm={() => {
					if (dialogKind === "terminate") {
						void employeeStore.terminate(dialogMode.employee);
					}
				}}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "restore"}
				icon={<RestartAltOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="info"
				title={t("employee.restore.title", {
					name: dialogKind === "restore" ? dialogMode.employee.name : "",
				})}
				content={t("employee.restore.body")}
				confirmLabel={t("employee.action.restore")}
				cancelLabel={t("common.cancel")}
				confirmVariant="primary"
				onCancel={employeeStore.closeDialog}
				onConfirm={() => {
					if (dialogKind === "restore") {
						void employeeStore.restore(dialogMode.employee);
					}
				}}
			/>
		</Box>
	);
});

export default EmployeePage;
