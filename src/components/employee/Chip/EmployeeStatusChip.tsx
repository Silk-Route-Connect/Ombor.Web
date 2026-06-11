import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatus } from "models/employee";
import { getEmployeeStatusColor } from "utils/employeeUtils";

import { Chip } from "@mui/material";

interface EmployeeStatusChipProps {
	status: EmployeeStatus;
}

const EmployeeStatusChip: React.FC<EmployeeStatusChipProps> = ({ status }) => {
	const { t } = useTranslation();

	return (
		<Chip
			label={t(`employee.status.${status}`)}
			color={getEmployeeStatusColor(status)}
			size="small"
		/>
	);
};

export default EmployeeStatusChip;
