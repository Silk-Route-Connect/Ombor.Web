import React from "react";

import type { SxProps, Theme } from "@mui/material";
import { Box } from "@mui/material";

interface UzsUnitProps {
	sx?: SxProps<Theme>;
}

/**
 * The muted «UZS» unit suffix, rendered with consistent styling and spacing
 * wherever an amount shows its currency inline. The app is UZS-only and
 * `formatCurrency` emits no symbol, so callers append this — using one component
 * keeps the gap before «UZS» uniform across the app (F-009).
 */
const UzsUnit: React.FC<UzsUnitProps> = ({ sx }) => (
	<Box
		component="span"
		sx={{ fontSize: 12, fontWeight: 600, color: "text.disabled", ml: "5px", ...sx }}
	>
		UZS
	</Box>
);

export default UzsUnit;
