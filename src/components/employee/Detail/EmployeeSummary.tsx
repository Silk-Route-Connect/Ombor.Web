import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import UzsUnit from "components/shared/Money/UzsUnit";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { Employee } from "models/employee";
import { figuresSx, radius } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { formatUzPhone } from "utils/phoneUtils";

import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { Box, Paper, Typography } from "@mui/material";

const cardSx = {
	border: 1,
	borderColor: "divider",
	borderRadius: `${radius.lg}px`,
} as const;

interface EmployeeSummaryProps {
	employee: Employee;
	/** Payroll paid in the current calendar month; null until the history loads. */
	paidThisMonth: number | null;
	/** Number of payouts; null until the history loads. */
	paymentCount: number | null;
}

/**
 * The employee summary under the name-only header: identity card (avatar, role,
 * status, phone, tenure) and the salary / paid-this-month / payouts stats.
 */
export const EmployeeSummary: React.FC<EmployeeSummaryProps> = ({
	employee,
	paidThisMonth,
	paymentCount,
}) => {
	const { t } = useTranslation();
	const terminated = employee.status === "Terminated";
	const phone = employee.contactInfo?.phoneNumbers?.[0];
	const month = new Date().getMonth() + 1;

	return (
		<>
			<Paper
				elevation={1}
				sx={{
					...cardSx,
					p: "16px 20px",
					mb: "20px",
					display: "flex",
					alignItems: "center",
					gap: "14px",
				}}
			>
				<EntityAvatar name={employee.name} size={52} muted={terminated} />
				<Box sx={{ minWidth: 0, flex: 1 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
						<Typography variant="h3" component="div">
							{employee.position}
						</Typography>
						<EmployeeStatusBadge status={employee.status} />
					</Box>
					<Typography variant="body2" sx={{ ...figuresSx, color: "text.secondary", mt: "5px" }}>
						{phone ? `${formatUzPhone(phone)} · ` : ""}
						{t("employee.since")} {formatDate(employee.dateOfEmployment)}
					</Typography>
				</Box>
			</Paper>

			<StatCardGrid columns={3}>
				<StatCard
					icon={<WorkOutlineIcon />}
					tone="primary"
					caption={t("employee.stat.salary")}
					value={formatCurrency(employee.salary)}
					unit={<UzsUnit label={t("employee.stat.salaryUnit")} sx={{ fontSize: 13 }} />}
				/>
				<StatCard
					icon={<EventAvailableOutlinedIcon />}
					tone="accent"
					caption={t("employee.stat.paidThisMonth", { month: t(`common.monthLower.${month}`) })}
					value={paidThisMonth === null ? t("common.dash") : formatCurrency(paidThisMonth)}
					unit={paidThisMonth === null ? undefined : "uzs"}
				/>
				<StatCard
					icon={<ReceiptLongOutlinedIcon />}
					caption={t("employee.stat.totalPayments")}
					value={paymentCount === null ? t("common.dash") : formatQuantity(paymentCount)}
				/>
			</StatCardGrid>
		</>
	);
};

export default EmployeeSummary;
