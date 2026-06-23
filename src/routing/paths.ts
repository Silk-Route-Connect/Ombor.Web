import { TransactionType } from "models/transaction";

/** Canonical route paths — the only place URL literals are declared. */
export const PATHS = {
	dashboard: "/",
	products: "/products",
	productDetail: "/products/:id",
	categories: "/categories",
	warehouses: "/warehouses",
	warehouseDetail: "/warehouses/:id",
	adjustments: "/adjustments",
	transfers: "/transfers",
	partners: "/partners",
	partnerDetail: "/partners/:id",
	orders: "/orders",
	orderDetail: "/orders/:id",
	sales: "/sales",
	salesDetail: "/sales/:id",
	supplies: "/supplies",
	suppliesDetail: "/supplies/:id",
	templates: "/templates",
	payments: "/payments",
	debts: "/debts",
	wallets: "/wallets",
	walletDetail: "/wallets/:id",
	employees: "/employees",
	employeeDetail: "/employees/:id",
	activityLog: "/activity-log",
	settings: "/settings",
	newSale: "/sales/new",
	newSupply: "/supplies/new",
	newOrder: "/orders/new",
	newPayment: "/payments/new",
	login: "/login",
	register: "/register",
	resetPassword: "/reset-password",
} as const;

/** Concrete detail route for a product (PATHS.productDetail with the id bound). */
export const productDetailPath = (id: number): string => `/products/${id}`;

/** Concrete detail route for a warehouse (PATHS.warehouseDetail with the id bound). */
export const warehouseDetailPath = (id: number): string => `/warehouses/${id}`;

/** Concrete detail route for a partner (PATHS.partnerDetail with the id bound). */
export const partnerDetailPath = (id: number): string => `/partners/${id}`;

/** Concrete detail route for a wallet (PATHS.walletDetail with the id bound). */
export const walletDetailPath = (id: number): string => `/wallets/${id}`;

/** Concrete detail route for an employee (PATHS.employeeDetail with the id bound). */
export const employeeDetailPath = (id: number): string => `/employees/${id}`;

/** Concrete detail route for an order (PATHS.orderDetail with the id bound). */
export const orderDetailPath = (id: number): string => `/orders/${id}`;

/** Concrete detail route for a payment (PATHS.payments with the id bound). */
export const paymentDetailPath = (id: number): string => `/payments/${id}`;

/** Concrete detail route for a sale/sale-refund transaction. */
export const saleDetailPath = (id: number): string => `/sales/${id}`;

/** Concrete detail route for a supply/supply-refund transaction. */
export const supplyDetailPath = (id: number): string => `/supplies/${id}`;

export const TRANSACTION_ROUTES: Record<TransactionType, string> = {
	Sale: "/sales",
	Supply: "/supplies",
	SaleRefund: "/refunds/sales",
	SupplyRefund: "/refunds/supplies",
};
