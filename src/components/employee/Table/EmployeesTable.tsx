import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EmployeeActionMenu from "components/employee/Table/ActionMenu/EmployeeActionMenu";
import {
	tableBodyCellSx as bodyCellSx,
	tableHeadCellSx as headCellSx,
} from "components/shared/Table/tableStyles";
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

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			{rows.length === 0 ? (
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
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
								{t("employee.table.employee")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("employee.position")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
								{t("employee.table.salary")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("employee.status")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("employee.dateOfEmployment")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, width: 56 }} />
						</tr>
					</thead>
					<tbody>
						{rows.map((employee) => {
							const terminated = employee.status === "Terminated";
							return (
								<Box
									component="tr"
									key={employee.id}
									onClick={() => onOpen(employee)}
									sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
								>
									<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
										<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
											<Avatar name={employee.name} dim={terminated} />
											<Typography
												component="span"
												sx={{
													fontWeight: 600,
													color: terminated ? "text.secondary" : "text.primary",
												}}
											>
												{employee.name}
											</Typography>
										</Box>
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, color: "text.secondary" }}>
										{employee.position}
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
										{formatCurrency(employee.salary)}
									</Box>
									<Box component="td" sx={bodyCellSx}>
										<EmployeeStatusBadge status={employee.status} />
									</Box>
									<Box component="td" sx={{ ...bodyCellSx, color: "text.secondary", ...numericSx }}>
										{formatDate(employee.dateOfEmployment)}
									</Box>
									<Box
										component="td"
										sx={{ ...bodyCellSx, textAlign: "right" }}
										onClick={(e) => e.stopPropagation()}
									>
										<EmployeeActionMenu
											employee={employee}
											onPay={() => onPay(employee)}
											onEdit={() => onEdit(employee)}
											onTerminate={() => onTerminate(employee)}
											onRestore={() => onRestore(employee)}
										/>
									</Box>
								</Box>
							);
						})}
					</tbody>
				</Box>
			)}
		</Paper>
	);
};

export default EmployeesTable;
