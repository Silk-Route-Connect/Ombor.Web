import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EmployeeActionMenu from "components/employee/Table/ActionMenu/EmployeeActionMenu";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Employee } from "models/employee";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface EmployeesTableProps {
	rows: Loadable<Employee[]>;
	isFiltering: boolean;
	onOpen: (employee: Employee) => void;
	onCreate: () => void;
	onPay: (employee: Employee) => void;
	onEdit: (employee: Employee) => void;
	onTerminate: (employee: Employee) => void;
	onRestore: (employee: Employee) => void;
}

const Avatar: React.FC<{ name: string; dim?: boolean }> = ({ name, dim }) => (
	<Box
		sx={{
			width: 34,
			height: 34,
			flex: "0 0 auto",
			borderRadius: "50%",
			display: "grid",
			placeItems: "center",
			bgcolor: dim ? designTokens.gray100 : "primary.light",
			color: dim ? designTokens.gray500 : "primary.main",
			fontSize: 14,
			fontWeight: 700,
		}}
	>
		{name.trim().charAt(0).toUpperCase()}
	</Box>
);

/**
 * Employees list on the shared DataTable (warm band, sortable columns, 10/25/50
 * pager, name-asc default): сотрудник · должность · зарплата · статус · дата
 * найма, each row opening the full-page detail; row actions in the shared ⋮ menu
 * (Выплатить / Редактировать / Уволить·Восстановить — a status change, never a
 * hard delete).
 */
export const EmployeesTable: React.FC<EmployeesTableProps> = ({
	rows,
	isFiltering,
	onOpen,
	onCreate,
	onPay,
	onEdit,
	onTerminate,
	onRestore,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<Employee>[]>(
		() => [
			{
				key: "name",
				headerName: t("employee.table.employee"),
				sortValue: (e) => e.name,
				renderCell: (e) => {
					const terminated = e.status === "Terminated";
					return (
						<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
							<Avatar name={e.name} dim={terminated} />
							<Typography
								component="span"
								sx={{ fontWeight: 600, color: terminated ? "text.secondary" : "text.primary" }}
							>
								{e.name}
							</Typography>
						</Box>
					);
				},
			},
			{
				key: "position",
				headerName: t("employee.position"),
				sortValue: (e) => e.position,
				renderCell: (e) => (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{e.position}
					</Box>
				),
			},
			{
				key: "status",
				headerName: t("employee.status"),
				sortValue: (e) => t(`employee.status.${e.status}`),
				renderCell: (e) => <EmployeeStatusBadge status={e.status} />,
			},
			{
				key: "dateOfEmployment",
				headerName: t("employee.dateOfEmployment"),
				sortValue: (e) => e.dateOfEmployment,
				renderCell: (e) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{formatDate(e.dateOfEmployment)}
					</Box>
				),
			},
			{
				key: "salary",
				headerName: t("employee.table.salary"),
				align: "right",
				sortValue: (e) => e.salary,
				renderCell: (e) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 700, fontSize: 15 }}>
						{formatCurrency(e.salary)}
					</Box>
				),
			},
			{
				key: "actions",
				headerName: "",
				align: "right",
				width: 56,
				renderCell: (e) => (
					<EmployeeActionMenu
						employee={e}
						onPay={() => onPay(e)}
						onEdit={() => onEdit(e)}
						onTerminate={() => onTerminate(e)}
						onRestore={() => onRestore(e)}
					/>
				),
			},
		],
		[t, onPay, onEdit, onTerminate, onRestore],
	);

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (rows.length === 0) {
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
					<Box
						sx={{
							width: 56,
							height: 56,
							borderRadius: 2,
							mx: "auto",
							mb: 2,
							display: "grid",
							placeItems: "center",
							bgcolor: "grey.50",
							border: 1,
							borderColor: "divider",
							color: "text.disabled",
						}}
					>
						<PeopleOutlineIcon sx={{ fontSize: 26 }} />
					</Box>
					<Typography variant="h2" sx={{ mb: 0.75 }}>
						{isFiltering ? t("employee.empty.searchTitle") : t("employee.empty.title")}
					</Typography>
					<Typography
						variant="body2"
						sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
					>
						{isFiltering ? t("employee.empty.searchBody") : t("employee.empty.body")}
					</Typography>
					{!isFiltering && (
						<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
							{t("employee.create")}
						</Button>
					)}
				</Box>
			</Paper>
		);
	}

	return (
		<DataTable<Employee>
			rows={rows}
			columns={columns}
			pagination
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
		/>
	);
};

export default EmployeesTable;
