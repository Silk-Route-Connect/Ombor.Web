// Employee detail — Bukhara Teal redesign (header, KPI cards, payments, contact).
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeStatusChip from "components/employee/Chip/EmployeeStatusChip";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import SummaryCards from "components/shared/Cards/SummaryCards";
import DateFilterPicker from "components/shared/Date/DateFilterPicker";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { Payment, PayrollKind } from "models/payment";
import { useStore } from "stores/StoreContext";
import { DateFilter } from "utils/dateUtils";
import { formatMonthYear, formatTenure } from "utils/employeeUtils";
import { formatMoney } from "utils/formatCurrency";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SavingsOutlinedIcon from "@mui/icons-material/SavingsOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
	Box,
	Button,
	Chip,
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

const formatDate = (date: string) => new Date(date).toLocaleDateString("ru-RU");

const ContactRow: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({
	icon,
	children,
}) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
		<Box sx={{ color: "text.disabled", display: "inline-flex" }}>{icon}</Box>
		<Typography variant="body2">{children}</Typography>
	</Box>
);

const EmployeeDetailPage: React.FC = observer(() => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { employeeStore, selectedEmployeeStore } = useStore();
	const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

	const employeeId = Number(id);

	useEffect(() => {
		employeeStore.getAll();
	}, [employeeStore]);

	const all = employeeStore.allEmployees;
	const isLoading = all === "loading";
	const employee: Employee | null = useMemo(
		() => (all === "loading" ? null : (all.find((e) => e.id === employeeId) ?? null)),
		[all, employeeId],
	);

	useEffect(() => {
		employeeStore.setSelectedEmployee(employee);
		return () => employeeStore.setSelectedEmployee(null);
	}, [employee, employeeStore]);

	const history = selectedEmployeeStore.payrollHistory;
	const filtered = selectedEmployeeStore.filteredPayrollHistory;

	const paidThisMonth = useMemo(() => {
		if (history === "loading") return null;
		const now = new Date();
		return history
			.filter((p) => {
				const d = new Date(p.date);
				return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
			})
			.reduce((sum, p) => sum + p.amount, 0);
	}, [history]);

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
				<CircularProgress />
			</Box>
		);
	}

	if (!employee) {
		return (
			<Box>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/employees")}>
					{translate("employeesTitle")}
				</Button>
				<Typography variant="body2" sx={{ color: "text.secondary", py: 6, textAlign: "center" }}>
					{translate("employee.detail.notFound")}
				</Typography>
			</Box>
		);
	}

	const phone = employee.contactInfo?.phoneNumbers?.find(Boolean);
	const subtitleParts = [
		employee.position,
		phone,
		`с ${formatDate(employee.dateOfEmployment)} (${formatTenure(employee.dateOfEmployment)})`,
	].filter(Boolean);

	const overpaid = paidThisMonth === null ? null : Math.max(0, paidThisMonth - employee.salary);
	const count = filtered === "loading" ? 0 : filtered.length;

	const closeMenu = () => setMenuAnchor(null);
	const runMenu = (action: () => void) => () => {
		closeMenu();
		action();
	};

	const handleDateChange = (f: DateFilter) => {
		if (f.type === "custom") selectedEmployeeStore.setCustom(f.from, f.to);
		else selectedEmployeeStore.setPreset(f.preset);
	};

	const paymentColumns: Column<Payment>[] = [
		{
			key: "date",
			headerName: translate("employee.detail.payments.col.date"),
			renderCell: (p) => (
				<Typography
					variant="body2"
					sx={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}
				>
					{formatDate(p.date)}
				</Typography>
			),
		},
		{
			key: "type",
			headerName: translate("employee.detail.payments.col.type"),
			renderCell: (p) => {
				const kind: PayrollKind =
					p.payrollKind ?? (p.amount >= employee.salary ? "Salary" : "Advance");
				return (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
						<Box
							sx={{
								width: 8,
								height: 8,
								borderRadius: "50%",
								bgcolor: kind === "Salary" ? "success.main" : "warning.main",
							}}
						/>
						<Typography variant="body2">
							{translate(`employee.detail.payments.kind.${kind}`)}
						</Typography>
					</Box>
				);
			},
		},
		{
			key: "period",
			headerName: translate("employee.detail.payments.col.period"),
			renderCell: (p) => (
				<Typography variant="body2">{formatMonthYear(p.period ?? p.date)}</Typography>
			),
		},
		{
			key: "amount",
			headerName: translate("employee.detail.payments.col.amount"),
			align: "right",
			renderCell: (p) => (
				<Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
					{formatMoney(p.amount)}
				</Typography>
			),
		},
		{
			key: "wallet",
			headerName: translate("employee.detail.payments.col.wallet"),
			renderCell: (p) => {
				const method = p.components?.[0]?.method ?? "Cash";
				return (
					<Box
						sx={{
							display: "inline-flex",
							alignItems: "center",
							gap: 0.75,
							color: "text.secondary",
						}}
					>
						<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 16 }} />
						<Typography variant="body2">{translate(`employee.detail.wallet.${method}`)}</Typography>
					</Box>
				);
			},
		},
	];

	const contact = employee.contactInfo;

	return (
		<Box>
			{/* Breadcrumb */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
				<Link
					component="button"
					onClick={() => navigate("/employees")}
					sx={{ fontSize: "0.875rem", fontWeight: 600 }}
				>
					{translate("employeesTitle")}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 16, color: "text.disabled" }} />
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{employee.name}
				</Typography>
			</Box>

			{/* Header */}
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 2,
					mb: 3,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
					<IconButton
						onClick={() => navigate("/employees")}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<ArrowBackIcon fontSize="small" />
					</IconButton>
					<InitialsAvatar name={employee.name} size={48} />
					<Box sx={{ minWidth: 0 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
							<Typography variant="h1">{employee.name}</Typography>
							<EmployeeStatusChip status={employee.status} />
						</Box>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
							{subtitleParts.join(" · ")}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Button
						variant="contained"
						startIcon={<PaymentsOutlinedIcon />}
						onClick={() => employeeStore.openPayment(employee)}
					>
						{translate("employee.action.pay")}
					</Button>
					<Button
						variant="outlined"
						startIcon={<EditOutlinedIcon />}
						onClick={() => employeeStore.openEdit(employee)}
					>
						{translate("common.edit")}
					</Button>
					<IconButton
						onClick={(e) => setMenuAnchor(e.currentTarget)}
						sx={{ border: 1, borderColor: "divider", color: "text.secondary" }}
					>
						<MoreVertIcon fontSize="small" />
					</IconButton>
					<Menu
						anchorEl={menuAnchor}
						open={Boolean(menuAnchor)}
						onClose={closeMenu}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem
							onClick={runMenu(() => employeeStore.openDelete(employee))}
							sx={{ color: "error.main" }}
						>
							<ListItemIcon>
								<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
							</ListItemIcon>
							<ListItemText>{translate("common.delete")}</ListItemText>
						</MenuItem>
					</Menu>
				</Box>
			</Box>

			{/* KPI cards */}
			<SummaryCards
				cards={[
					{
						icon: <PaymentsOutlinedIcon />,
						tone: "teal",
						caption: translate("employee.salary"),
						value: formatMoney(employee.salary),
						unit: translate("employee.detail.salaryUnit"),
					},
					{
						icon: <TrendingUpIcon />,
						tone: "teal",
						caption: translate("employee.detail.kpi.paidThisMonth"),
						value: paidThisMonth === null ? "—" : formatMoney(paidThisMonth),
						unit: paidThisMonth === null ? undefined : "UZS",
						valueColor: "primary.main",
					},
					{
						icon: <SavingsOutlinedIcon />,
						tone: "saffron",
						caption: translate("employee.detail.kpi.overpaid"),
						value: overpaid === null ? "—" : formatMoney(overpaid),
						unit: overpaid === null ? undefined : "UZS",
						valueColor: "secondary.dark",
					},
				]}
			/>

			{/* Payments */}
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
				<Typography variant="h2">{translate("employee.detail.payments.title")}</Typography>
				<Chip label={count} size="small" sx={{ bgcolor: "grey.100", color: "text.secondary" }} />
			</Box>
			<Box sx={{ mb: 2 }}>
				<DateFilterPicker value={selectedEmployeeStore.dateFilter} onChange={handleDateChange} />
			</Box>
			<DataTable<Payment> rows={filtered} columns={paymentColumns} pagination />

			{/* Contact info */}
			{contact && (
				<Paper
					elevation={1}
					sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, p: 2.5, mt: 3 }}
				>
					<Typography variant="h3" sx={{ fontWeight: 600, mb: 2 }}>
						{translate("employee.detail.contact.title")}
					</Typography>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
						{contact.phoneNumbers?.filter(Boolean).map((p) => (
							<ContactRow key={p} icon={<PhoneOutlinedIcon sx={{ fontSize: 18 }} />}>
								{p}
							</ContactRow>
						))}
						{contact.email && (
							<ContactRow icon={<EmailOutlinedIcon sx={{ fontSize: 18 }} />}>
								{contact.email}
							</ContactRow>
						)}
						{contact.address && (
							<ContactRow icon={<HomeOutlinedIcon sx={{ fontSize: 18 }} />}>
								{contact.address}
							</ContactRow>
						)}
						{contact.telegramAccount && (
							<ContactRow icon={<SendOutlinedIcon sx={{ fontSize: 18 }} />}>
								{contact.telegramAccount}
							</ContactRow>
						)}
					</Box>
				</Paper>
			)}

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeeDetailPage;
