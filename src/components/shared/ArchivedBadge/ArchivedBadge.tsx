import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import { Box } from "@mui/material";

interface ArchivedBadgeProps {
	/**
	 * Badge text. Defaults to the shared «Архив» label; pass a module-specific
	 * key when its wording differs (e.g. the partner module's «в архиве»).
	 */
	label?: string;
}

/**
 * Small uppercase «Архив» status pill per the DSN-1 `.arch-badge`. The single
 * shared definition — every archived cue (list rows + detail headers) renders
 * through this so the colour/typography stay in one place.
 */
export const ArchivedBadge: React.FC<ArchivedBadgeProps> = ({ label }) => {
	const { t } = useTranslation();

	return (
		<Box
			component="span"
			sx={{
				fontSize: 10.5,
				fontWeight: 600,
				letterSpacing: "0.02em",
				textTransform: "uppercase",
				color: designTokens.gray500,
				bgcolor: designTokens.gray100,
				border: "1px solid",
				borderColor: designTokens.gray200,
				px: "7px",
				py: "1px",
				borderRadius: "999px",
				whiteSpace: "nowrap",
			}}
		>
			{label ?? t("common.archived")}
		</Box>
	);
};

export default ArchivedBadge;
