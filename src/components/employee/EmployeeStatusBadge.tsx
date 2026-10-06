import React from "react";
import { useTranslation } from "react-i18next";
import StatusPill from "components/shared/Chip/StatusPill";
import { EmployeeStatus } from "models/employee";
import { ChipTokenKey } from "theme";

/** Active → green, OnVacation → amber, Terminated → neutral (settled, not an alert). */
const STATUS_TOKEN: Record<EmployeeStatus, ChipTokenKey> = {
	Active: "success",
	OnVacation: "warning",
	Terminated: "neutral",
};

export const EmployeeStatusBadge: React.FC<{ status: EmployeeStatus }> = ({ status }) => {
	const { t } = useTranslation();
	// The served status is a nullable string — an unknown value renders neutral with
	// the raw text rather than white-screening the row.
	const token = STATUS_TOKEN[status] ?? "neutral";
	const label = t(`employee.status.${status}`, { defaultValue: String(status ?? "—") });
	return <StatusPill token={token} label={label} />;
};

export default EmployeeStatusBadge;
