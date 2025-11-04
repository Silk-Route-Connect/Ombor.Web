import React from "react";
import { translate } from "i18n/i18n";
import { EmployeeStatus } from "models/employee";
import { getEmployeeStatusColor } from "utils/employeeUtils";

import { Chip } from "@mui/material";

interface EmployeeStatusChipProps {
	status: EmployeeStatus;
}

const EmployeeStatusChip: React.FC<EmployeeStatusChipProps> = ({ status }) => (
	<Chip
		label={translate(`employee.status.${status}`)}
		color={getEmployeeStatusColor(status)}
		size="small"
	/>
);

export default EmployeeStatusChip;
