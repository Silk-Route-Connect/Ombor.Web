import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatus } from "models/employee";
import { designTokens } from "theme";

import { Box } from "@mui/material";

/** Status pill tints: Active → success, OnVacation → saffron, Terminated → gray. */
const STATUS_TINT: Record<EmployeeStatus, { bg: string; color: string }> = {
	Active: { bg: designTokens.successBg, color: "#17835A" },
	OnVacation: { bg: designTokens.accentSoft, color: designTokens.saffron700 },
	Terminated: { bg: designTokens.gray100, color: designTokens.gray600 },
};

export const EmployeeStatusBadge: React.FC<{ status: EmployeeStatus }> = ({ status }) => {
	const { t } = useTranslation();
	const tint = STATUS_TINT[status];
	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				fontSize: 12,
				fontWeight: 600,
				px: "10px",
				py: "3px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
				bgcolor: tint.bg,
				color: tint.color,
			}}
		>
			{t(`employee.status.${status}`)}
		</Box>
	);
};

export default EmployeeStatusBadge;
