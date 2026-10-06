import React from "react";
import { BrowserRouter, Navigate, Route } from "react-router-dom";
import AppLayout from "layouts/AppLayout";
import { SnackbarProvider, useSnackbar } from "notistack";
import ActivityLogPage from "pages/ActivityLogPage";
import CategoryPage from "pages/CategoryPage";
import DashboardPage from "pages/DashboardPage";
import DebtPage from "pages/DebtPage";
import EmployeeDetailPage from "pages/EmployeeDetailPage";
import EmployeePage from "pages/EmployeePage";
import InvoicePrintPage from "pages/InvoicePrintPage";
import LoginPage from "pages/LoginPage";
import NewOrderPage from "pages/NewOrderPage";
import NewSalePage from "pages/NewSalePage";
import NewSupplyPage from "pages/NewSupplyPage";
import NotFoundPage from "pages/NotFoundPage";
import OrderDetailPage from "pages/OrderDetailPage";
import OrderPage from "pages/OrderPage";
import PartnerDetailPage from "pages/PartnerDetailPage";
import PartnerPage from "pages/PartnerPage";
import PartnerStatementPage from "pages/PartnerStatementPage";
import PaymentDetailPage from "pages/PaymentDetailPage";
import PaymentPage from "pages/PaymentPage";
import ProductDetailPage from "pages/ProductDetailPage";
import ProductPage from "pages/ProductPage";
import RegisterPage from "pages/RegisterPage";
import ReportPage from "pages/ReportPage";
import ReportPrintPage from "pages/ReportPrintPage";
import ReportsPage from "pages/ReportsPage";
import ResetPasswordPage from "pages/ResetPasswordPage";
import SettingsPage from "pages/SettingsPage";
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
import { OPEN_CREATE_STATE } from "routing/navigationState";
import { PATHS } from "routing/paths";
import RequireAuth from "routing/RequireAuth";
import { SentryRoutes as Routes } from "services/telemetry";
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
			<SnackbarProvider
				maxSnack={3}
				preventDuplicate
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
			>
				<BrowserRouter>
					<AppBootstrap />
					<SnackbarInjector />

					<Routes>
						<Route element={<GuestOnly />}>
							<Route path={PATHS.login} element={<LoginPage />} />
							<Route path={PATHS.register} element={<RegisterPage />} />
							<Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />
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
								<Route path={PATHS.adjustmentDetail} element={<StockAdjustmentPage />} />
								<Route path={PATHS.transfers} element={<TransferPage />} />
								<Route path={PATHS.transferDetail} element={<TransferPage />} />
								<Route path={PATHS.partners} element={<PartnerPage />} />
								<Route path={PATHS.partnerDetail} element={<PartnerDetailPage />} />
								<Route path={PATHS.partnerStatement} element={<PartnerStatementPage />} />
								<Route path={PATHS.orders} element={<OrderPage />} />
								<Route path={PATHS.orderDetail} element={<OrderDetailPage />} />
								<Route path={PATHS.orderInvoice} element={<InvoicePrintPage source="Order" />} />
								<Route path={PATHS.supplies} element={<TransactionPage mode="Supply" />} />
								<Route
									path={PATHS.suppliesDetail}
									element={<TransactionDetailPage direction="Supply" />}
								/>
								<Route
									path={PATHS.suppliesInvoice}
									element={<InvoicePrintPage source="Supply" />}
								/>
								<Route path={PATHS.sales} element={<TransactionPage mode="Sale" />} />
								<Route
									path={PATHS.salesDetail}
									element={<TransactionDetailPage direction="Sale" />}
								/>
								<Route path={PATHS.salesInvoice} element={<InvoicePrintPage source="Sale" />} />
								<Route path={PATHS.templates} element={<TemplatePage />} />
								<Route path={PATHS.payments} element={<PaymentPage />} />
								<Route path={`${PATHS.payments}/:id`} element={<PaymentDetailPage />} />
								<Route path={PATHS.debts} element={<DebtPage />} />
								<Route path={PATHS.wallets} element={<WalletPage />} />
								<Route path={PATHS.walletDetail} element={<WalletDetailPage />} />
								<Route path={PATHS.newSale} element={<NewSalePage />} />
								<Route path={PATHS.newSupply} element={<NewSupplyPage />} />
								<Route path={PATHS.newOrder} element={<NewOrderPage />} />
								<Route
									path={PATHS.newPayment}
									element={<Navigate to={PATHS.payments} replace state={OPEN_CREATE_STATE} />}
								/>
								<Route path={PATHS.employees} element={<EmployeePage />} />
								<Route path={PATHS.employeeDetail} element={<EmployeeDetailPage />} />
								<Route path={PATHS.activityLog} element={<ActivityLogPage />} />
								<Route path={PATHS.reports} element={<ReportsPage />} />
								<Route path={PATHS.report} element={<ReportPage />} />
								<Route path={PATHS.reportPrint} element={<ReportPrintPage />} />
								<Route path={PATHS.settings} element={<SettingsPage />} />
								<Route path="*" element={<NotFoundPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</SnackbarProvider>
		</StoreProvider>
	);
}

export default App;
