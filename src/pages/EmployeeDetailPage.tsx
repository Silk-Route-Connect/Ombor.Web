import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeStatusChip from "components/employee/Chip/EmployeeStatusChip";
import EmployeeDetailsTab from "components/employee/Detail/EmployeeDetailsTab";
import EmployeeDialogs from "components/employee/EmployeeDialogs";
import PayrollTab from "components/employee/SidePane/Tabs/PayrollTab";
import InitialsAvatar from "components/shared/Avatar/InitialsAvatar";
import SummaryCards from "components/shared/Cards/SummaryCards";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Employee } from "models/employee";
import { useStore } from "stores/StoreContext";
import { formatDateTime } from "utils/dateUtils";
import { formatMoney } from "utils/formatCurrency";
import { primaryCurrencyAmount, totalsByCurrency } from "utils/payrollStats";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Tab,
	Tabs,
	Typography,
} from "@mui/material";

const EmployeeDetailPage: React.FC = observer(() => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { employeeStore, selectedEmployeeStore } = useStore();
	const [tab, setTab] = useState<"details" | "payroll">("details");
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

	const history = selectedEmployeeStore.payrollHistory;
	const totalPaid = history === "loading" ? null : primaryCurrencyAmount(totalsByCurrency(history));

	const closeMenu = () => setMenuAnchor(null);
	const runMenu = (action: () => void) => () => {
		closeMenu();
		action();
	};

	return (
		<Box>
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
					<InitialsAvatar name={employee.name} size={44} />
					<Box sx={{ minWidth: 0 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<Typography variant="h1">{employee.name}</Typography>
							<EmployeeStatusChip status={employee.status} />
						</Box>
						<Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
							{employee.position}
						</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Button
						variant="contained"
						startIcon={<PaymentsOutlinedIcon />}
						onClick={() => employeeStore.openPayment(employee)}
					>
						{translate("employee.payroll")}
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
						<MenuItem onClick={runMenu(() => employeeStore.openEdit(employee))}>
							<ListItemIcon>
								<EditOutlinedIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{translate("common.edit")}</ListItemText>
						</MenuItem>
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

			<SummaryCards
				cards={[
					{
						icon: <PaymentsOutlinedIcon />,
						tone: "teal",
						caption: translate("employee.salary"),
						value: formatMoney(employee.salary),
						unit: "UZS",
					},
					{
						icon: <CalendarMonthOutlinedIcon />,
						tone: "teal",
						caption: translate("employee.dateOfEmployment"),
						value: formatDateTime(employee.dateOfEmployment),
					},
					{
						icon: <PaymentsOutlinedIcon />,
						tone: "saffron",
						caption: translate("employee.detail.totalPaid"),
						value: totalPaid === null ? "—" : formatMoney(totalPaid.amount),
						unit:
							totalPaid === null
								? undefined
								: totalPaid.others.length > 0
									? `${totalPaid.currency} +${totalPaid.others.length}`
									: totalPaid.currency,
					},
				]}
			/>

			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				sx={{
					mb: 2,
					"& .MuiTab-root": { textTransform: "none", fontWeight: 500, fontSize: "0.9375rem" },
				}}
			>
				<Tab value="details" label={translate("employee.detail.tab.details")} />
				<Tab value="payroll" label={translate("employee.detail.tab.payroll")} />
			</Tabs>

			{tab === "details" ? (
				<EmployeeDetailsTab employee={employee} />
			) : (
				<PayrollTab employeeId={employee.id} />
			)}

			<EmployeeDialogs />
		</Box>
	);
});

export default EmployeeDetailPage;
