import React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeStatus } from "models/employee";
import { designTokens } from "theme";

import { Box } from "@mui/material";

/**
 * Status pill — all colours from theme tokens (no inline hex), with a border per
 * the chip system: Active → success green, OnVacation → warning orange,
 * Terminated → neutral stone (a settled inactive state, not an alert).
 */
const STATUS_TINT: Record<EmployeeStatus, { bg: string; color: string; border: string }> = {
	Active: { bg: designTokens.successBg, color: "success.main", border: designTokens.successBorder },
	OnVacation: {
		bg: designTokens.warningBg,
		color: "warning.main",
		border: designTokens.warningBorder,
	},
	Terminated: {
		bg: designTokens.gray100,
		color: designTokens.gray600,
		border: designTokens.gray200,
	},
};

export const EmployeeStatusBadge: React.FC<{ status: EmployeeStatus }> = ({ status }) => {
	const { t } = useTranslation();
	// The served DTO types `status` as a nullable string (openapi) — fall back to
	// the neutral tint + the raw value so a null/unknown status can't white-screen
	// the list/detail where this badge renders per-row.
	const tint = STATUS_TINT[status] ?? STATUS_TINT.Terminated;
	const label = t(`employee.status.${status}`, { defaultValue: String(status ?? "—") });
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
				border: "1px solid",
				borderColor: tint.border,
			}}
		>
			{label}
		</Box>
	);
};

export default EmployeeStatusBadge;
