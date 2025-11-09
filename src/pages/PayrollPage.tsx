import React, { useEffect, useMemo } from "react";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import PayrollHeader from "components/payroll/Header/PayrollHeader";
import PayrollTable from "components/payroll/Table/PayrollTable";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { formatDateTime } from "utils/dateUtils";

import { Box } from "@mui/material";

const PayrollPage: React.FC = observer(() => {
	const { payrollStore, employeeStore, notificationStore } = useStore();

	useEffect(() => {
		payrollStore.getAll();
		employeeStore.getAll();
	}, [payrollStore, employeeStore]);

	const handleSave = async (payload: PayrollFormPayload) => {
		const { dialogMode } = payrollStore;

		if (dialogMode.kind === "form" && dialogMode.payment) {
			await payrollStore.update({
				paymentId: dialogMode.payment.id,
				...payload,
			});
		} else {
			await payrollStore.create(payload);
		}
	};

	const handleDeleteConfirmed = () => {
		if (!payrollStore.selectedPayment?.employeeId) {
			notificationStore.error(translate("payroll.error.missingEmployee"));
			return;
		}

		payrollStore.delete({
			employeeId: payrollStore.selectedPayment.employeeId,
			paymentId: payrollStore.selectedPayment.id,
		});
	};

	const payrollCount = useMemo(() => {
		if (payrollStore.filteredPayrollPayments === "loading") {
			return "";
		}

		return payrollStore.filteredPayrollPayments.length.toString();
	}, [payrollStore.filteredPayrollPayments]);

	const selectedEmployee = useMemo(() => {
		if (payrollStore.filterEmployeeId === null || employeeStore.allEmployees === "loading") {
			return null;
		}

		return employeeStore.allEmployees.find((e) => e.id === payrollStore.filterEmployeeId) || null;
	}, [payrollStore.filterEmployeeId, employeeStore.allEmployees]);

	const { dialogMode, selectedPayment } = payrollStore;
	const dialogKind = dialogMode.kind;

	const deleteMessage = selectedPayment
		? translate("payroll.deleteConfirmation", {
				amount: selectedPayment.amount.toLocaleString(),
				currency: selectedPayment.components[0]?.currency || "",
				employeeName: selectedPayment.employeeName || "",
				date: formatDateTime(selectedPayment.date),
			})
		: "";

	return (
		<Box>
			<PayrollHeader
				searchValue={payrollStore.searchTerm}
				selectedEmployee={selectedEmployee}
				titleCount={payrollCount}
				onSearch={payrollStore.setSearch}
				onEmployeeChange={payrollStore.setFilterEmployeeId}
				onCreate={payrollStore.openCreate}
			/>

			<PayrollTable
				data={payrollStore.filteredPayrollPayments}
				pagination
				onSort={payrollStore.setSort}
				onEdit={payrollStore.openEdit}
				onDelete={payrollStore.openDelete}
			/>

			<PayrollFormModal
				isOpen={dialogKind === "form"}
				isSaving={payrollStore.isSaving}
				mode={payrollStore.selectedPayment}
				onClose={payrollStore.closeDialog}
				onSave={handleSave}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "delete"}
				title={translate("common.deleteTitle")}
				content={deleteMessage}
				onConfirm={handleDeleteConfirmed}
				onCancel={payrollStore.closeDialog}
			/>
		</Box>
	);
});

export default PayrollPage;
