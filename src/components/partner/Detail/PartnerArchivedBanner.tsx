import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import { Box, Typography } from "@mui/material";

/** Archived-state banner per the bundle's `.arch-banner` (saffron accent edge). */
export const PartnerArchivedBanner: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-start",
				gap: "12px",
				mb: "18px",
				p: "14px 16px",
				bgcolor: designTokens.gray25,
				border: "1px solid",
				borderColor: designTokens.gray300,
				borderLeft: "3px solid",
				borderLeftColor: "secondary.main",
				borderRadius: "8px",
			}}
		>
			<ArchiveOutlinedIcon sx={{ fontSize: 18, color: designTokens.saffron600, mt: "1px" }} />
			<Typography sx={{ fontSize: 13, color: designTokens.gray700, lineHeight: 1.55 }}>
				<Box component="b" sx={{ color: "text.primary", fontWeight: 700 }}>
					{t("partner.detail.archived.title")}
				</Box>{" "}
				{t("partner.detail.archived.body")}
			</Typography>
		</Box>
	);
};

export default PartnerArchivedBanner;
