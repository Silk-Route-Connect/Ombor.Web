import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

const GuestOnly: React.FC = observer(() => {
	const { authStore } = useStore();

	if (authStore.isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
});

export default GuestOnly;
