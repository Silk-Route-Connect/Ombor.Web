import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EmployeeFormModal from "components/employee/Form/EmployeeFormModal";
import PayrollFormModal from "components/payroll/Form/PayrollFormModal";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SegmentedControl } from "components/shared/SegmentedControl/SegmentedControl";
import { EmployeeFormPayload } from "hooks/employee/useEmployeeForm";
import { PayrollFormPayload } from "hooks/payroll/usePayrollForm";
import { observer } from "mobx-react-lite";
import { PaymentRecord } from "models/payment";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { designTokens, numericSx } from "theme";
import { PresetOption } from "utils/dateUtils";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PersonOffOutlinedIcon from "@mui/icons-material/PersonOffOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import {
	Box,
	ButtonBase,
	CircularProgress,
	IconButton,
	Link,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Paper,
	Typography,
} from "@mui/material";

const MONTHS_RU = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];
const periodLabel = (iso: string): string => {
	const d = new Date(iso);
	return `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
};

const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "background.paper",
} as const;
const bodyCellSx = {
	p: "13px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

const DetailActionsMenu: React.FC<{
	terminated: boolean;
	onEdit: () => void;
	onTerminate: () => void;
	onRestore: () => void;
}> = ({ terminated, onEdit, onTerminate, onRestore }) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);
	return (
		<>
			<IconButton
				onClick={(e) => setAnchor(e.currentTarget)}
				aria-label="actions"
				sx={{
					width: 38,
					height: 38,
					borderRadius: "8px",
					border: "1px solid",
					borderColor: designTokens.gray300,
					color: designTokens.gray600,
				}}
			>
				<MoreVertIcon sx={{ fontSize: 20 }} />
			</IconButton>
			<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
				<MenuItem
					onClick={() => {
						close();
						onEdit();
					}}
				>
					<ListItemIcon>
						<EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
					</ListItemIcon>
					<ListItemText primary={t("common.edit")} />
				</MenuItem>
				{terminated ? (
					<MenuItem
						onClick={() => {
							close();
							onRestore();
						}}
					>
						<ListItemIcon>
							<RestartAltOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />
						</ListItemIcon>
						<ListItemText
							primary={t("employee.action.restore")}
							slotProps={{ primary: { sx: { color: "success.main" } } }}
						/>
					</MenuItem>
				) : (
					<MenuItem
						onClick={() => {
							close();
							onTerminate();
						}}
					>
						<ListItemIcon>
							<PersonOffOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
						</ListItemIcon>
						<ListItemText
							primary={t("employee.action.terminate")}
							slotProps={{ primary: { sx: { color: "error.main" } } }}
						/>
					</MenuItem>
				)}
			</Menu>
		</>
	);
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
	const navigate = useNavigate();
	const { id } = useParams<{ id: string }>();
	const employeeId = Number(id);
	const { employeeStore, selectedEmployeeStore, payrollStore } = useStore();

	useEffect(() => {
		if (Number.isFinite(employeeId)) {
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

	const walletLabel = (payment: PaymentRecord): string => payment.walletName || "—";

	if (employee === null) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const terminated = employee.status === "Terminated";

	return (
		<Box>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					mb: "16px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Link
					component="button"
					underline="hover"
					onClick={() => navigate(PATHS.employees)}
					sx={{ color: "text.secondary", fontSize: 13 }}
				>
					{t("employeesTitle")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography component="b" sx={{ fontSize: 13, fontWeight: 600, color: "text.primary" }}>
					{employee.name}
				</Typography>
			</Box>

			<Box sx={{ display: "flex", alignItems: "center", gap: "16px", mb: "22px" }}>
				<ButtonBase
					onClick={() => navigate(PATHS.employees)}
					aria-label={t("back")}
					sx={{
						width: 40,
						height: 40,
						flex: "0 0 auto",
						borderRadius: "8px",
						border: "1px solid",
						borderColor: designTokens.gray300,
						bgcolor: "background.paper",
						color: designTokens.gray700,
						"&:hover": { bgcolor: designTokens.gray50 },
					}}
				>
					<ChevronLeftIcon sx={{ fontSize: 20 }} />
				</ButtonBase>
				<Box
					sx={{
						width: 56,
						height: 56,
						flex: "0 0 auto",
						borderRadius: "50%",
						display: "grid",
						placeItems: "center",
						bgcolor: "primary.light",
						color: "primary.main",
						fontSize: 22,
						fontWeight: 700,
					}}
				>
					{employee.name.trim().charAt(0).toUpperCase()}
				</Box>
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
						<Typography
							component="h1"
							sx={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2 }}
						>
							{employee.name}
						</Typography>
						<EmployeeStatusBadge status={employee.status} />
					</Box>
					<Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: "6px" }}>
						{employee.position}
						{employee.contactInfo?.phoneNumbers?.[0] &&
							` · ${employee.contactInfo.phoneNumbers[0]}`}
						{` · ${t("employee.since")} ${formatDate(employee.dateOfEmployment)}`}
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
					{terminated ? (
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
					)}
					<DetailActionsMenu
						terminated={terminated}
						onEdit={() => employeeStore.openEdit(employee)}
						onTerminate={() => employeeStore.openTerminate(employee)}
						onRestore={() => employeeStore.openRestore(employee)}
					/>
				</Box>
			</Box>

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
					label={t("employee.stat.paidThisMonth", { month: MONTHS_RU[now.getMonth()] })}
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

			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				{history === "loading" ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
						<CircularProgress size={26} />
					</Box>
				) : filteredRows.length === 0 ? (
					<Box sx={{ p: "44px 24px 48px", textAlign: "center" }}>
						<PaymentsOutlinedIcon sx={{ fontSize: 26, color: "text.disabled" }} />
						<Typography sx={{ fontWeight: 600, mt: 1 }}>
							{t("employee.payrollEmptyTitle")}
						</Typography>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
							{t("employee.payrollEmptyBody")}
						</Typography>
					</Box>
				) : (
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
									{t("employee.payroll.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("employee.payroll.type")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("employee.payroll.period")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("employee.payroll.amount")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, pr: "18px" }}>
									{t("employee.payroll.wallet")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{filteredRows.map((p) => (
								<Box component="tr" key={p.id}>
									<Box
										component="td"
										sx={{ ...bodyCellSx, pl: "18px", ...numericSx, color: "text.secondary" }}
									>
										{formatDate(p.date)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
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
												sx={{
													width: 7,
													height: 7,
													borderRadius: "50%",
													bgcolor: designTokens.purpleText,
												}}
											/>
											{t("employee.payroll.salary")}
										</Box>
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, color: "text.secondary" }}>
										{p.period ?? periodLabel(p.date)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 700,
											fontSize: 15,
										}}
									>
										{formatCurrency(p.amount)}
									</Box>
									<Box
										component="td"
										sx={{ ...bodyCellSx, pr: "18px", color: designTokens.gray700 }}
									>
										{walletLabel(p)}
									</Box>
								</Box>
							))}
						</tbody>
					</Box>
				)}
			</Paper>

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
