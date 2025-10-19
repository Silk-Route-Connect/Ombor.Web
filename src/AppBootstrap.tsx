import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "stores/StoreContext";

const AppBootstrap: React.FC = () => {
	const navigate = useNavigate();
	const { authStore } = useStore();

	React.useEffect(() => {
		authStore.configureSideEffects({
			onRedirectToLogin: () => {
				navigate("/login", { replace: true });
			},
			onRedirectToApp: () => {
				navigate("/", { replace: true });
			},
			onResetAllStores: () => {},
		});

		void authStore.bootstrap();
	}, [authStore, navigate]);

	return null;
};

export default AppBootstrap;
