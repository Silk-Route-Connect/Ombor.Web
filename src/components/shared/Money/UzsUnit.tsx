import React from "react";
import { useTranslation } from "react-i18next";

import type { SxProps, Theme } from "@mui/material";
import { Box } from "@mui/material";

interface UzsUnitProps {
	/** A unit with a qualifier, e.g. «UZS / мес»; defaults to «UZS». */
	label?: string;
	sx?: SxProps<Theme>;
}

/**
 * The muted «UZS» unit after a total or hero figure — never inside a table
 * cell (columns say «Сумма» and omit the unit). One component keeps the gap,
 * size and colour of the suffix identical everywhere (F-009, tables-24).
 */
const UzsUnit: React.FC<UzsUnitProps> = ({ label, sx }) => {
	const { t } = useTranslation();
	return (
		<Box
			component="span"
			sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary", ml: "5px", ...sx }}
		>
			{label ?? t("common.unit.uzs")}
		</Box>
	);
};

export default UzsUnit;
