import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import EmployeePayrollTable from "components/employee/Detail/EmployeePayrollTable";
import EmployeeSummary from "components/employee/Detail/EmployeeSummary";
import { employeeManageActions } from "components/employee/employeeActions";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { isPresent, isReady, readyOr } from "helpers/Loading";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { useRouteEntityId } from "hooks/shared/useRouteEntityId";
import { observer } from "mobx-react-lite";
import { PATHS, paymentDetailPath } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { PresetOption } from "utils/dateUtils";

import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { Box, Typography } from "@mui/material";

const PERIOD_OPTIONS: { value: PresetOption; labelKey: string }[] = [
	{ value: "week", labelKey: "reportRangeWeek" },
	{ value: "month", labelKey: "reportRangeMonth" },
	{ value: "alltime", labelKey: "reportRangeAll" },
];

const EmployeeDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const employeeId = useRouteEntityId();
	const { employeeStore, selectedEmployeeStore, payrollStore } = useStore();

	useEffect(() => {
		if (employeeId !== null) {
			void selectedEmployeeStore.load(employeeId);
		}
		return () => selectedEmployeeStore.clear();
	}, [employeeId, selectedEmployeeStore]);

	const employeeState = employeeId === null ? null : selectedEmployeeStore.employee;
	// The loaded employee doubles as the dialogs' target and is updated in place by edits.
	const employee = employeeStore.selectedEmployee;
	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	const history = selectedEmployeeStore.payrollHistory;
	const historyReady = isReady(history);
	const allHistory = useMemo(() => readyOr(history, []), [history]);
	const filtered = selectedEmployeeStore.filteredPayrollHistory;
	const filteredRows = readyOr(filtered, []);

	// Paid in the current calendar month (the «Выплачено за <месяц>» stat).
	const now = new Date();
	const paidThisMonth = useMemo(
		() =>
			allHistory
				.filter((p) => {
					const d = new Date(p.date);
					return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
				})
				.reduce((s, p) => s + p.amount, 0),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[allHistory],
	);

	const presetValue: PresetOption =
		selectedEmployeeStore.dateFilter.type === "preset"
			? selectedEmployeeStore.dateFilter.preset
			: "alltime";

	const handleFormSave = (payload: EmployeeFormPayload) => {
		if (employeeStore.selectedEmployee) {
			employeeStore.update({ id: employeeStore.selectedEmployee.id, ...payload });
		}
	};

	const handlePayrollSave = async (payload: PayrollFormPayload) => {
		const ok = await payrollStore.create(payload);
		if (ok) {
			employeeStore.closeDialog();
			await selectedEmployeeStore.getPayrollHistory();
		}
	};

	if (!isPresent(employeeState) || employee === null) {
		return (
			<LoadStateView
				state={isPresent(employeeState) ? "loading" : employeeState}
				onRetry={() => employeeId !== null && void selectedEmployeeStore.load(employeeId)}
				errorTitle={t("employees.error.getById")}
				notFound={{ title: t("employee.detail.notFound"), backTo: PATHS.employees }}
			/>
		);
	}

	const terminated = employee.status === "Terminated";

	// «Выплатить» / «Восстановить» is the standalone primary action; the kebab holds the rest.
	const actions = employeeManageActions(t, employee, {
		onEdit: () => employeeStore.openEdit(employee),
		onTerminate: () => employeeStore.openTerminate(employee),
		onRestore: () => employeeStore.openRestore(employee),
		onDelete: () => employeeStore.openDelete(employee),
	});

	return (
		<Box>
			<DetailPageHeader
				backTo={PATHS.employees}
				title={employee.name}
				primaryAction={
					terminated ? (
						<PrimaryButton
							icon={<RestartAltOutlinedIcon />}
							onClick={() => employeeStore.openRestore(employee)}
						>
							{t("employee.action.restore")}
						</PrimaryButton>
					) : (
						<PrimaryButton
							icon={<PaymentsOutlinedIcon />}
							onClick={() => employeeStore.openPayment(employee)}
						>
							{t("employee.action.pay")}
						</PrimaryButton>
					)
				}
				actions={actions}
			/>

			<EmployeeSummary
				employee={employee}
				paidThisMonth={historyReady ? paidThisMonth : null}
				paymentCount={historyReady ? allHistory.length : null}
			/>

			<Typography component="h2" variant="h2" sx={{ mb: "14px" }}>
				{t("employee.payrollSection")}
			</Typography>

			{!isReady(history) ? (
				<LoadStateView
					state={history}
					size="section"
					onRetry={() => void selectedEmployeeStore.getPayrollHistory()}
					errorTitle={t("payroll.error.getHistory")}
				/>
			) : (
				<EmployeePayrollTable
					employeeName={employee.name}
					payments={filteredRows}
					onOpen={(payment) => navigate(paymentDetailPath(payment.id))}
					filters={
						<SegmentedControl<PresetOption>
							value={presetValue}
							onChange={(v) => selectedEmployeeStore.setPreset(v)}
							options={PERIOD_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
						/>
					}
				/>
			)}

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

			<EmployeeDialogs onDeleted={() => navigate(PATHS.employees)} />
		</Box>
	);
});

export default EmployeeDetailPage;
