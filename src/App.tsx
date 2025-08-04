import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SnackbarProvider, useSnackbar } from "notistack";
import CreateTransactionPage from "pages/CreateTransactionPage";
import PartnerPage from "pages/PartnerPage";
import PaymentPage from "pages/PaymentPage";
import ProductPage from "pages/ProductPage";
import TemplatePage from "pages/TemplatePage";
import TransactionPage from "pages/TransactionPage";

import AppLayout from "./layouts/AppLayout";
import CategoryPage from "./pages/CategoryPage";
import { StoreProvider, useStore } from "./stores/StoreContext";

function SnackbarInjector() {
	const { enqueueSnackbar } = useSnackbar();
	const { notificationStore } = useStore();

	React.useEffect(() => {
		notificationStore.inject(enqueueSnackbar);
	}, [enqueueSnackbar, notificationStore]);

	return null;
}

function App() {
	return (
		<StoreProvider>
			<SnackbarProvider
				maxSnack={3}
				anchorOrigin={{
					vertical: "top",
					horizontal: "center",
				}}
			>
				<SnackbarInjector />
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<AppLayout />}>
							<Route index element={<CategoryPage />} />
							<Route path="categories" element={<CategoryPage />} />
							<Route path="products" element={<ProductPage />} />
							<Route path="partners" element={<PartnerPage />} />
							<Route path="supplies" element={<TransactionPage mode="Supply" />} />
							<Route path="sales" element={<TransactionPage mode="Sale" />} />
							<Route path="templates" element={<TemplatePage />} />
							<Route path="payments" element={<PaymentPage />} />
							<Route path="new/sales" element={<CreateTransactionPage mode="Sale" />} />
							<Route path="new/supplies" element={<CreateTransactionPage mode="Supply" />} />
						</Route>
					</Routes>
				</BrowserRouter>
			</SnackbarProvider>
		</StoreProvider>
	);
}

export default App;
