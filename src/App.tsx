import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SnackbarProvider, useSnackbar } from "notistack";
import ProductPage from "pages/ProductPage";

import AppLayout from "./layouts/AppLayout";
import CategoryPage from "./pages/CategoryPage";
import { rootStore } from "./stores/RootStore";
import { StoreProvider } from "./stores/StoreContext";

function SnackbarInjector({ children }: Readonly<{ children: React.ReactNode }>) {
	const { enqueueSnackbar } = useSnackbar();
	React.useEffect(() => {
		rootStore.notificationStore.inject(enqueueSnackbar);
	}, [enqueueSnackbar]);
	return <>{children}</>;
}

function App() {
	return (
		<SnackbarProvider
			maxSnack={3}
			anchorOrigin={{
				vertical: "top",
				horizontal: "center",
			}}
		>
			<SnackbarInjector>
				<StoreProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/" element={<AppLayout />}>
								<Route index element={<CategoryPage />} />
								<Route path="categories" element={<CategoryPage />} />
								<Route path="products" element={<ProductPage />} />
							</Route>
						</Routes>
					</BrowserRouter>
				</StoreProvider>
			</SnackbarInjector>
		</SnackbarProvider>
	);
}

export default App;
