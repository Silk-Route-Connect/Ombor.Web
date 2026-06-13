import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import { Chip } from "@mui/material";

/** Small uppercase «Архив» badge per the bundle's `.arch-badge`. */
export const ArchivedBadge: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Chip
			label={t("product.table.archivedBadge")}
			size="small"
			sx={{
				height: "auto",
				py: "1px",
				fontSize: 10.5,
				fontWeight: 600,
				letterSpacing: "0.02em",
				textTransform: "uppercase",
				color: designTokens.gray500,
				bgcolor: designTokens.gray100,
				border: "1px solid",
				borderColor: designTokens.gray200,
				"& .MuiChip-label": { px: "7px" },
			}}
		/>
	);
};

export default ArchivedBadge;
