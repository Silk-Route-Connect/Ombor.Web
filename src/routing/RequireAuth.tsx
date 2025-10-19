import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import AppSplashScreen from "components/shared/AppSplashScreen/AppSplashScreen";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

const RequireAuth: React.FC = observer(() => {
	const { authStore } = useStore();

	if (authStore.status === "checking") {
		return <AppSplashScreen message="Loading…" />;
	}

	if (!authStore.isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
});

export default RequireAuth;
