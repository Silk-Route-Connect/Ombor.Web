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
	orders: "/orders",
	sales: "/sales",
	supplies: "/supplies",
	templates: "/templates",
	payments: "/payments",
	debts: "/debts",
	wallets: "/wallets",
	employees: "/employees",
	payrolls: "/payrolls",
	activityLog: "/activity-log",
	settings: "/settings",
	newSale: "/new/sales",
	newSupply: "/new/supplies",
	newOrder: "/new/orders",
	newPayment: "/new/payments",
	login: "/login",
	register: "/register",
} as const;

/** Concrete detail route for a product (PATHS.productDetail with the id bound). */
export const productDetailPath = (id: number): string => `/products/${id}`;

/** Concrete detail route for a warehouse (PATHS.warehouseDetail with the id bound). */
export const warehouseDetailPath = (id: number): string => `/warehouses/${id}`;

export const TRANSACTION_ROUTES: Record<TransactionType, string> = {
	Sale: "/sales",
	Supply: "/supplies",
	SaleRefund: "/refunds/sales",
	SupplyRefund: "/refunds/supplies",
};
