import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "layouts/AppLayout";
import { SnackbarProvider, useSnackbar } from "notistack";
import CategoryPage from "pages/CategoryPage";
import CreateTransactionPage from "pages/CreateTransactionPage";
import EmployeePage from "pages/EmployeePage";
import LoginPage from "pages/LoginPage";
import PartnerPage from "pages/PartnerPage";
import PaymentPage from "pages/PaymentPage";
import PayrollPage from "pages/PayrollPage";
import PlaceholderPage from "pages/PlaceholderPage";
import ProductPage from "pages/ProductPage";
import RegisterPage from "pages/RegisterPage";
import TemplatePage from "pages/TemplatePage";
import TransactionPage from "pages/TransactionPage";
import GuestOnly from "routing/GuestOnly";
import { PATHS } from "routing/paths";
import RequireAuth from "routing/RequireAuth";
import { StoreProvider, useStore } from "stores/StoreContext";

import AppBootstrap from "./AppBootstrap";

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
			<SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
				<BrowserRouter>
					<AppBootstrap />
					<SnackbarInjector />

					<Routes>
						<Route element={<GuestOnly />}>
							<Route path={PATHS.login} element={<LoginPage />} />
							<Route path={PATHS.register} element={<RegisterPage />} />
						</Route>

						<Route element={<RequireAuth />}>
							<Route path={PATHS.dashboard} element={<AppLayout />}>
								<Route index element={<PlaceholderPage titleKey="sidebar.dashboard" />} />
								<Route path={PATHS.categories} element={<CategoryPage />} />
								<Route path={PATHS.products} element={<ProductPage />} />
								<Route
									path={PATHS.warehouses}
									element={<PlaceholderPage titleKey="sidebar.warehouses" />}
								/>
								<Route
									path={PATHS.adjustments}
									element={<PlaceholderPage titleKey="sidebar.adjustments" />}
								/>
								<Route
									path={PATHS.transfers}
									element={<PlaceholderPage titleKey="sidebar.transfers" />}
								/>
								<Route path={PATHS.partners} element={<PartnerPage />} />
								<Route
									path={PATHS.orders}
									element={<PlaceholderPage titleKey="sidebar.orders" />}
								/>
								<Route path={PATHS.supplies} element={<TransactionPage mode="Supply" />} />
								<Route path={PATHS.sales} element={<TransactionPage mode="Sale" />} />
								<Route path={PATHS.templates} element={<TemplatePage />} />
								<Route path={PATHS.payments} element={<PaymentPage />} />
								<Route path={`${PATHS.payments}/:id`} element={<PaymentPage />} />
								<Route path={PATHS.debts} element={<PlaceholderPage titleKey="sidebar.debts" />} />
								<Route
									path={PATHS.wallets}
									element={<PlaceholderPage titleKey="sidebar.wallets" />}
								/>
								<Route path={PATHS.newSale} element={<CreateTransactionPage mode="Sale" />} />
								<Route path={PATHS.newSupply} element={<CreateTransactionPage mode="Supply" />} />
								<Route
									path={PATHS.newOrder}
									element={<PlaceholderPage titleKey="page.newOrder.title" />}
								/>
								<Route
									path={PATHS.newPayment}
									element={<PlaceholderPage titleKey="page.newPayment.title" />}
								/>
								<Route path={PATHS.employees} element={<EmployeePage />} />
								<Route path={PATHS.payrolls} element={<PayrollPage />} />
								<Route
									path={PATHS.activityLog}
									element={<PlaceholderPage titleKey="page.activityLog.title" />}
								/>
								<Route
									path={PATHS.settings}
									element={<PlaceholderPage titleKey="sidebar.settings" />}
								/>
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</SnackbarProvider>
		</StoreProvider>
	);
}

export default App;
