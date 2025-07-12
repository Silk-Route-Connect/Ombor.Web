import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SnackbarProvider, useSnackbar } from "notistack";
import TransactionCreatePage from "pages/CreateTransactionPage";
import PartnerPage from "pages/PartnerPage";
import PaymentPage from "pages/PaymentPage";
import ProductPage from "pages/ProductPage";
import SalePage from "pages/SalePage";
import SupplyPage from "pages/SupplyPage";
import TemplatePage from "pages/TemplatePage";

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
								<Route path="partners" element={<PartnerPage />} />
								<Route path="supplies" element={<SupplyPage />} />
								<Route path="sales" element={<SalePage />} />
								<Route path="templates" element={<TemplatePage />} />
								<Route path="payments" element={<PaymentPage />} />
								<Route path="new/sales" element={<TransactionCreatePage mode="Sale" />} />
								<Route path="new/supplies" element={<TransactionCreatePage mode="Supply" />} />
							</Route>
						</Routes>
					</BrowserRouter>
				</StoreProvider>
			</SnackbarInjector>
		</SnackbarProvider>
	);
}

export default App;
