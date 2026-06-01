import React from "react";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

/**
 * Employee mutation dialogs (create/edit, salary payment, delete), driven by the
 * shared `employeeStore.dialogMode`. Rendered by both the employee list and the
 * employee detail page so either can trigger them.
 */
const EmployeeDialogs: React.FC = observer(() => {
	const { employeeStore, payrollStore } = useStore();
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

	const handleDeleteConfirmed = () => {
		if (employeeStore.selectedEmployee) {
			employeeStore.delete(employeeStore.selectedEmployee.id);
		}
	};

	return (
		<>
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
				isOpen={dialogKind === "delete"}
				title={translate("common.deleteTitle")}
				content={translate("employee.deleteConfirmation", {
					employeeName: employeeStore.selectedEmployee?.name ?? "",
				})}
				onConfirm={handleDeleteConfirmed}
				onCancel={employeeStore.closeDialog}
			/>
		</>
	);
});

export default EmployeeDialogs;
