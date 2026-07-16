import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import DetailPageHeader from "components/shared/Detail/DetailPageHeader";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import WalletLink from "components/wallet/Links/WalletLink";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { TFunction } from "i18next";
import { observer } from "mobx-react-lite";
import { PaymentRecord } from "models/payment";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { formatDate, formatDateTime, PresetOption } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

/** «Июль 2026» from a payroll period ("YYYY-MM") or an ISO date, via i18n month names. */
const monthYearLabel = (t: TFunction, value: string): string => {
	const match = /^(\d{4})-(\d{2})/.exec(value);
	if (!match) {
		return value;
	}
	return `${t(`common.month.${Number(match[2])}`)} ${match[1]}`;
};

const Stat: React.FC<{ label: string; value: React.ReactNode; accent?: boolean }> = ({
	label,
	value,
	accent,
}) => (
	<Paper
		elevation={1}
		sx={{ border: 1, borderColor: "divider", borderRadius: "12px", p: "17px 20px" }}
	>
		<Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>{label}</Typography>
		<Typography
			sx={{
				...numericSx,
				fontSize: 22,
				fontWeight: 700,
				mt: "8px",
				color: accent ? "success.main" : "text.primary",
			}}
		>
			{value}
		</Typography>
	</Paper>
);

const PERIOD_OPTIONS: { value: PresetOption; label: string }[] = [
	{ value: "week", label: "Неделя" },
	{ value: "month", label: "Месяц" },
	{ value: "alltime", label: "Весь период" },
];

const EmployeeDetailPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { id } = useParams<{ id: string }>();
	const employeeId = Number(id);
	const { employeeStore, selectedEmployeeStore, payrollStore } = useStore();

	useEffect(() => {
		if (Number.isFinite(employeeId)) {
			// Clear any lingering subject so the page shows its loader (not stale data)
			// until getById resolves for this id.
			employeeStore.setSelectedEmployee(null);
			employeeStore.getById(employeeId);
		}
		return () => employeeStore.setSelectedEmployee(null);
	}, [employeeId, employeeStore]);

	const employee = employeeStore.selectedEmployee;
	const { dialogMode } = employeeStore;
	const dialogKind = dialogMode.kind;

	const history = selectedEmployeeStore.payrollHistory;
	const allHistory = history === "loading" ? [] : history;
	const filtered = selectedEmployeeStore.filteredPayrollHistory;
	const filteredRows = filtered === "loading" ? [] : filtered;

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

	const payrollColumns = useMemo<Column<PaymentRecord>[]>(
		() => [
			{
				key: "date",
				headerName: t("employee.payroll.date"),
				sortValue: (p) => p.date,
				renderCell: (p) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{formatDateTime(p.date)}
					</Box>
				),
			},
			{
				key: "type",
				headerName: t("employee.payroll.type"),
				sortValue: () => t("employee.payroll.salary"),
				renderCell: () => (
					<Box
						component="span"
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							fontSize: 12.5,
							fontWeight: 600,
						}}
					>
						<Box
							sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: designTokens.purpleText }}
						/>
						{t("employee.payroll.salary")}
					</Box>
				),
			},
			{
				key: "period",
				headerName: t("employee.payroll.period"),
				sortValue: (p) => p.period ?? p.date,
				renderCell: (p) => (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{monthYearLabel(t, p.period ?? p.date)}
					</Box>
				),
			},
			{
				key: "wallet",
				headerName: t("employee.payroll.wallet"),
				sortValue: (p) => p.walletName ?? "",
				renderCell: (p) =>
					p.walletName ? (
						<WalletLink id={p.walletId} name={p.walletName} />
					) : (
						<Box component="span" sx={{ color: designTokens.gray700 }}>
							—
						</Box>
					),
			},
			{
				key: "amount",
				headerName: t("employee.payroll.amount"),
				align: "right",
				sortValue: (p) => p.amount,
				renderCell: (p) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 15 }}>
						{formatCurrency(p.amount)}
					</Box>
				),
			},
		],
		[t],
	);

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

	if (employee === null) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const terminated = employee.status === "Terminated";
	const phone = employee.contactInfo?.phoneNumbers?.[0];

	// Kebab: edit + the status change (terminate/restore); «Выплатить»/«Восстановить»
	// is the standalone primary action.
	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" />,
			onClick: () => employeeStore.openEdit(employee),
		},
		terminated
			? {
					key: "restore",
					label: t("employee.action.restore"),
					icon: <RestartAltOutlinedIcon fontSize="small" />,
					labelColor: "success.main",
					dividerBefore: true,
					onClick: () => employeeStore.openRestore(employee),
				}
			: {
					key: "terminate",
					label: t("employee.action.terminate"),
					icon: <PersonOffOutlinedIcon fontSize="small" />,
					tone: "danger",
					dividerBefore: true,
					onClick: () => employeeStore.openTerminate(employee),
				},
	];

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

			{/* Identity card — the avatar, status + role and contact/tenure that left
			    the name-only header (like Partners' balance card). */}
			<Paper
				elevation={1}
				sx={{
					border: 1,
					borderColor: "divider",
					borderRadius: "12px",
					p: "16px 20px",
					mb: "20px",
					display: "flex",
					alignItems: "center",
					gap: "14px",
				}}
			>
				<Box
					sx={{
						width: 52,
						height: 52,
						flex: "0 0 auto",
						borderRadius: "50%",
						display: "grid",
						placeItems: "center",
						bgcolor: terminated ? designTokens.gray100 : "primary.light",
						color: terminated ? designTokens.gray500 : "primary.main",
						fontSize: 21,
						fontWeight: 700,
					}}
				>
					{employee.name.trim().charAt(0).toUpperCase()}
				</Box>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
						<Typography sx={{ fontSize: 15, fontWeight: 700 }}>{employee.position}</Typography>
						<EmployeeStatusBadge status={employee.status} />
					</Box>
					<Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: "5px" }}>
						{phone ? `${phone} · ` : ""}
						{t("employee.since")} {formatDate(employee.dateOfEmployment)}
					</Typography>
				</Box>
			</Paper>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
					gap: "16px",
					mb: "24px",
				}}
			>
				<Stat
					label={t("employee.stat.salary")}
					value={
						<>
							{formatCurrency(employee.salary)}{" "}
							<Box component="small" sx={{ fontSize: 12, fontWeight: 500, color: "text.disabled" }}>
								{t("employee.stat.salaryUnit")}
							</Box>
						</>
					}
				/>
				<Stat
					accent
					label={t("employee.stat.paidThisMonth", {
						month: t(`common.month.${now.getMonth() + 1}`),
					})}
					value={
						<>
							{formatCurrency(paidThisMonth)}{" "}
							<Box component="small" sx={{ fontSize: 12, fontWeight: 500, color: "text.disabled" }}>
								UZS
							</Box>
						</>
					}
				/>
				<Stat label={t("employee.stat.totalPayments")} value={allHistory.length} />
			</Box>

			<Box
				sx={{ display: "flex", alignItems: "center", gap: "12px", mb: "14px", flexWrap: "wrap" }}
			>
				<Typography component="h2" sx={{ fontSize: 17, fontWeight: 700 }}>
					{t("employee.payrollSection")}
				</Typography>
				<Box
					component="span"
					sx={{
						...numericSx,
						fontSize: 12.5,
						fontWeight: 700,
						px: "8px",
						py: "1px",
						borderRadius: "999px",
						bgcolor: "grey.100",
						color: "text.secondary",
					}}
				>
					{allHistory.length}
				</Box>
				<Box sx={{ flexGrow: 1 }} />
				<SegmentedControl<PresetOption>
					value={presetValue}
					onChange={(v) => selectedEmployeeStore.setPreset(v)}
					options={PERIOD_OPTIONS}
				/>
			</Box>

			{history === "loading" ? (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress size={26} />
				</Box>
			) : filteredRows.length === 0 ? (
				<Paper
					elevation={1}
					sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
				>
					<Box sx={{ p: "44px 24px 48px", textAlign: "center" }}>
						<PaymentsOutlinedIcon sx={{ fontSize: 26, color: "text.disabled" }} />
						<Typography sx={{ fontWeight: 600, mt: 1 }}>
							{t("employee.payrollEmptyTitle")}
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
							{t("employee.payrollEmptyBody")}
						</Typography>
					</Box>
				</Paper>
			) : (
				<DataTable<PaymentRecord>
					rows={filteredRows}
					columns={payrollColumns}
					pagination
					defaultSort={{ key: "date", order: "desc" }}
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

export default EmployeeDetailPage;
