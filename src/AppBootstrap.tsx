import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "stores/StoreContext";

const AppBootstrap: React.FC = () => {
	const navigate = useNavigate();
	const { authStore } = useStore();
	const [isInitialized, setIsInitialized] = React.useState(false);

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

		if (!isInitialized) {
			setIsInitialized(true);
			void authStore.bootstrap();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
};

export default AppBootstrap;
