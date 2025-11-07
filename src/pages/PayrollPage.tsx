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
	const { payrollStore, employeeStore } = useStore();

	useEffect(() => {
		payrollStore.getAll();
		employeeStore.getAll();
	}, [payrollStore, employeeStore]);

	const handleSave = async (payload: PayrollFormPayload, employeeId: number) => {
		const { dialogMode } = payrollStore;

		if (dialogMode.kind === "form" && dialogMode.payment) {
			await payrollStore.update({
				employeeId,
				paymentId: dialogMode.payment.id,
				...payload,
			});
		} else {
			await payrollStore.create({
				employeeId,
				...payload,
			});
		}
	};

	const handleDeleteConfirmed = () => {
		if (payrollStore.selectedPayment?.employeeId) {
			payrollStore.delete({
				employeeId: payrollStore.selectedPayment.employeeId,
				paymentId: payrollStore.selectedPayment.id,
			});
		}
	};

	const payrollCount = useMemo(() => {
		if (payrollStore.filteredPayrollPayments === "loading") {
			return "";
		}
		return payrollStore.filteredPayrollPayments.length.toString();
	}, [payrollStore.filteredPayrollPayments]);

	const { dialogMode, selectedPayment } = payrollStore;
	const dialogKind = dialogMode.kind;

	const deleteMessage = selectedPayment
		? translate("payroll.deleteConfirmation", {
				amount: selectedPayment.amount.toLocaleString(),
				currency: selectedPayment.components[0]?.currency || "",
				employeeName: selectedPayment.employeename || "",
				date: formatDateTime(selectedPayment.date),
			})
		: "";

	return (
		<Box>
			<PayrollHeader
				searchValue={payrollStore.searchTerm}
				selectedEmployee={payrollStore.selectedEmployee}
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
				payment={dialogMode.kind === "form" ? (dialogMode.payment ?? null) : null}
				employee={dialogMode.kind === "form" ? (dialogMode.employee ?? null) : null}
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
