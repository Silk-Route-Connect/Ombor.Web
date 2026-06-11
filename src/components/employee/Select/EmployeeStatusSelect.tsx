import React from "react";
import { useTranslation } from "react-i18next";
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
}) => {
	const { t } = useTranslation();

	return (
		<Select
			size={size}
			value={value || ""}
			onChange={(e) => onChange(e.target.value ? e.target.value : null)}
			sx={{ minWidth }}
			displayEmpty
		>
			<MenuItem value="">{t("employee.allStatuses")}</MenuItem>
			{EMPLOYEE_STATUSES.map((status) => (
				<MenuItem key={status} value={status}>
					{t(`employee.status.${status}`)}
				</MenuItem>
			))}
		</Select>
	);
};

export default EmployeeStatusSelect;
