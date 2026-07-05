import React from "react";
import { useTranslation } from "react-i18next";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box, Button, Typography } from "@mui/material";

/**
 * Full-page fallback rendered by the root Sentry.ErrorBoundary when a render
 * crash escapes every component. A reload is the only safe recovery from a
 * broken render tree.
 */
const ErrorFallback: React.FC = () => {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "12px",
				px: 3,
				textAlign: "center",
				bgcolor: "background.default",
			}}
		>
			<ErrorOutlineIcon sx={{ fontSize: 48, color: "error.main" }} />
			<Typography variant="h5">{t("common.errorBoundary.title")}</Typography>
			<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
				{t("common.errorBoundary.message")}
			</Typography>
			<Button variant="contained" sx={{ mt: "10px" }} onClick={() => window.location.reload()}>
				{t("common.errorBoundary.reload")}
			</Button>
		</Box>
	);
};

export default ErrorFallback;
