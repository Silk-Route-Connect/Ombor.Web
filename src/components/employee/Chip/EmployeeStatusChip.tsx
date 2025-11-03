import React from "react";
import { translate } from "i18n/i18n";
import { EmployeeStatus } from "models/employee";

import { Chip } from "@mui/material";

interface EmployeeStatusChipProps {
	status: EmployeeStatus;
}

const getStatusColor = (status: EmployeeStatus): "success" | "error" | "warning" | "default" => {
	switch (status) {
		case "Active":
			return "success";
		case "Terminated":
			return "error";
		case "OnVacation":
			return "warning";
		default:
			return "default";
	}
};

const EmployeeStatusChip: React.FC<EmployeeStatusChipProps> = ({ status }) => (
	<Chip
		label={translate(`employee.status.${status}`)}
		color={getStatusColor(status)}
		size="small"
	/>
);

export default EmployeeStatusChip;
