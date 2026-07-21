import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PATHS } from "routing/paths";

import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";

/**
 * Catch-all page for unknown routes — rendered inside the app shell so the user
 * keeps the sidebar/topbar and a clear way back, instead of a blank screen.
 */
export default function NotFoundPage() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<Box>
			<PageHeader title={t("page.notFound.title")} />
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
					<SearchOffOutlinedIcon />
				</Box>
				<Typography sx={{ fontWeight: 600, color: "text.secondary", mb: 2 }}>
					{t("page.notFound.message")}
				</Typography>
				<Button variant="contained" color="primary" onClick={() => navigate(PATHS.dashboard)}>
					{t("page.notFound.back")}
				</Button>
			</Paper>
		</Box>
	);
}
