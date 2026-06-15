import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "layouts/AppLayout";
import { SnackbarProvider, useSnackbar } from "notistack";
import CategoryPage from "pages/CategoryPage";
import CreateTransactionPage from "pages/CreateTransactionPage";
import DashboardPage from "pages/DashboardPage";
import DebtPage from "pages/DebtPage";
import EmployeeDetailPage from "pages/EmployeeDetailPage";
import EmployeePage from "pages/EmployeePage";
import LoginPage from "pages/LoginPage";
import OrderDetailPage from "pages/OrderDetailPage";
import OrderPage from "pages/OrderPage";
import PartnerDetailPage from "pages/PartnerDetailPage";
import PartnerPage from "pages/PartnerPage";
import PaymentDetailPage from "pages/PaymentDetailPage";
import PaymentPage from "pages/PaymentPage";
import PayrollPage from "pages/PayrollPage";
import PlaceholderPage from "pages/PlaceholderPage";
import ProductDetailPage from "pages/ProductDetailPage";
import ProductPage from "pages/ProductPage";
import RegisterPage from "pages/RegisterPage";
import StockAdjustmentPage from "pages/StockAdjustmentPage";
import TemplatePage from "pages/TemplatePage";
import TransactionDetailPage from "pages/TransactionDetailPage";
import TransactionPage from "pages/TransactionPage";
import TransferPage from "pages/TransferPage";
import WalletDetailPage from "pages/WalletDetailPage";
import WalletPage from "pages/WalletPage";
import WarehouseDetailPage from "pages/WarehouseDetailPage";
import WarehousePage from "pages/WarehousePage";
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
								<Route index element={<DashboardPage />} />
								<Route path={PATHS.categories} element={<CategoryPage />} />
								<Route path={PATHS.products} element={<ProductPage />} />
								<Route path={PATHS.productDetail} element={<ProductDetailPage />} />
								<Route path={PATHS.warehouses} element={<WarehousePage />} />
								<Route path={PATHS.warehouseDetail} element={<WarehouseDetailPage />} />
								<Route path={PATHS.adjustments} element={<StockAdjustmentPage />} />
								<Route path={PATHS.transfers} element={<TransferPage />} />
								<Route path={PATHS.partners} element={<PartnerPage />} />
								<Route path={PATHS.partnerDetail} element={<PartnerDetailPage />} />
								<Route path={PATHS.orders} element={<OrderPage />} />
								<Route path={PATHS.orderDetail} element={<OrderDetailPage />} />
								<Route path={PATHS.supplies} element={<TransactionPage mode="Supply" />} />
								<Route
									path={PATHS.suppliesDetail}
									element={<TransactionDetailPage direction="Supply" />}
								/>
								<Route path={PATHS.sales} element={<TransactionPage mode="Sale" />} />
								<Route
									path={PATHS.salesDetail}
									element={<TransactionDetailPage direction="Sale" />}
								/>
								<Route path={PATHS.templates} element={<TemplatePage />} />
								<Route path={PATHS.payments} element={<PaymentPage />} />
								<Route path={`${PATHS.payments}/:id`} element={<PaymentDetailPage />} />
								<Route path={PATHS.debts} element={<DebtPage />} />
								<Route path={PATHS.wallets} element={<WalletPage />} />
								<Route path={PATHS.walletDetail} element={<WalletDetailPage />} />
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
								<Route path={PATHS.employeeDetail} element={<EmployeeDetailPage />} />
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
