import React from "react";
import { translate } from "i18n/i18n";
import { EmployeeStatus } from "models/employee";

import { Chip } from "@mui/material";

interface EmployeeStatusChipProps {
	status: EmployeeStatus;
}

// Soft status chips per the design: Active = green, OnVacation = saffron,
// Terminated = muted gray (NOT alarming red).
const STYLES: Record<EmployeeStatus, { bgcolor: string; color: string }> = {
	Active: { bgcolor: "success.light", color: "success.main" },
	OnVacation: { bgcolor: "warning.light", color: "warning.main" },
	Terminated: { bgcolor: "grey.200", color: "text.secondary" },
};

const EmployeeStatusChip: React.FC<EmployeeStatusChipProps> = ({ status }) => (
	<Chip
		label={translate(`employee.status.${status}`)}
		size="small"
		sx={{ ...STYLES[status], fontWeight: 600 }}
	/>
);

export default EmployeeStatusChip;
