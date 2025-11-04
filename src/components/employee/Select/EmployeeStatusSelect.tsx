import React from "react";
import { translate } from "i18n/i18n";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";

import { MenuItem, Select } from "@mui/material";

interface EmployeeStatusSelectProps {
	value: EmployeeStatus | null;
	minWidth?: number;
	size?: "small" | "medium";
	onChange: (value: EmployeeStatus | null) => void;
}

const EmployeeStatusSelect: React.FC<EmployeeStatusSelectProps> = ({
	value,
	minWidth = 200,
	size = "small",
	onChange,
}) => (
	<Select
		size={size}
		value={value || ""}
		onChange={(e) => onChange(e.target.value ? e.target.value : null)}
		sx={{ minWidth }}
		displayEmpty
	>
		<MenuItem value="">{translate("employee.allStatuses")}</MenuItem>
		{EMPLOYEE_STATUSES.map((status) => (
			<MenuItem key={status} value={status}>
				{translate(`employee.status.${status}`)}
			</MenuItem>
		))}
	</Select>
);

export default EmployeeStatusSelect;
