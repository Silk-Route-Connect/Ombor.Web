import React from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "components/shared/PageHeader/PageHeader";

import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { Box, Paper, Typography } from "@mui/material";

interface PlaceholderPageProps {
	/** i18n key of the module title shown as the page heading. */
	titleKey: string;
}

/**
 * Shared stand-in for v1 pages that are routed but not yet built.
 * Renders the module title and an "in development" empty state.
 */
export default function PlaceholderPage({ titleKey }: Readonly<PlaceholderPageProps>) {
	const { t } = useTranslation();

	return (
		<Box>
			<PageHeader title={t(titleKey)} />
			<Paper
				variant="outlined"
				sx={{ borderRadius: 1.5, py: 8, px: 3, textAlign: "center", borderColor: "divider" }}
			>
				<Box
					sx={{
						width: 56,
						height: 56,
						borderRadius: 1.5,
						bgcolor: "background.default",
						border: 1,
						borderColor: "divider",
						display: "inline-grid",
						placeItems: "center",
						color: "text.disabled",
						mb: 2,
					}}
				>
					<ConstructionOutlinedIcon />
				</Box>
				<Typography sx={{ fontWeight: 600, color: "text.secondary" }}>
					{t("common.pageInDevelopment")}
				</Typography>
			</Paper>
		</Box>
	);
}
