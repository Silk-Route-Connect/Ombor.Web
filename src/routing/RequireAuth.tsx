import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

import { Box, CircularProgress } from "@mui/material";

const RequireAuth: React.FC = observer(() => {
	const { authStore } = useStore();
	const location = useLocation();

	if (authStore.status === "idle" || authStore.status === "checking") {
		return (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!authStore.isAuthenticated) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	// Render protected routes
	return <Outlet />;
});

export default RequireAuth;
