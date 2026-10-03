import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatusBadge } from "components/employee/EmployeeStatusBadge";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import UzsUnit from "components/shared/Money/UzsUnit";
import { Employee } from "models/employee";
import { numericSx, radius } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatUzPhone } from "utils/phoneUtils";

import { Box, Paper, Typography } from "@mui/material";

const cardSx = {
	border: 1,
	borderColor: "divider",
	borderRadius: `${radius.lg}px`,
} as const;

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
	<Paper elevation={1} sx={{ ...cardSx, p: "17px 20px" }}>
		<Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
		<Typography sx={{ ...numericSx, fontSize: 20, fontWeight: 700, mt: "8px" }}>{value}</Typography>
	</Paper>
);

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
						<Typography sx={{ fontSize: 15, fontWeight: 700 }}>{employee.position}</Typography>
						<EmployeeStatusBadge status={employee.status} />
					</Box>
					<Typography sx={{ ...numericSx, fontSize: 13, color: "text.secondary", mt: "5px" }}>
						{phone ? `${formatUzPhone(phone)} · ` : ""}
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
							{formatCurrency(employee.salary)}
							<UzsUnit label={t("employee.stat.salaryUnit")} />
						</>
					}
				/>
				<Stat
					label={t("employee.stat.paidThisMonth", { month: t(`common.monthLower.${month}`) })}
					value={
						paidThisMonth === null ? (
							t("common.dash")
						) : (
							<>
								{formatCurrency(paidThisMonth)}
								<UzsUnit />
							</>
						)
					}
				/>
				<Stat
					label={t("employee.stat.totalPayments")}
					value={paymentCount === null ? t("common.dash") : paymentCount}
				/>
			</Box>
		</>
	);
};

export default EmployeeSummary;
