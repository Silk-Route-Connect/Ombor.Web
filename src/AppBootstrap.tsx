import React from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

const AppBootstrap: React.FC = () => {
	const navigate = useNavigate();
	const store = useStore();
	const { authStore } = store;
	const [isInitialized, setIsInitialized] = React.useState(false);

	React.useEffect(() => {
		authStore.configureSideEffects({
			onRedirectToLogin: () => {
				navigate(PATHS.login, { replace: true });
			},
			onRedirectToApp: () => {
				navigate(PATHS.dashboard, { replace: true });
			},
			onResetAllStores: () => store.reset(),
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
