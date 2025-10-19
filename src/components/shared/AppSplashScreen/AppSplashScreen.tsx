import React from "react";

import { Box, CircularProgress, Typography } from "@mui/material";

const AppSplashScreen: React.FC<{ message?: string }> = ({ message }) => {
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				width: "100%",
				bgcolor: (theme) => theme.palette.background.default,
				gap: 2,
			}}
		>
			<CircularProgress size={48} />
			{message && (
				<Typography variant="body1" color="text.secondary">
					{message}
				</Typography>
			)}
		</Box>
	);
};

export default AppSplashScreen;
