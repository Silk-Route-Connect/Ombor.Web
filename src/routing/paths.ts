import type { TransactionType } from "models/transaction";

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
	partnerStatement: "/partners/:id/statement",
	orders: "/orders",
	orderDetail: "/orders/:id",
	orderInvoice: "/orders/:id/print",
	sales: "/sales",
	salesDetail: "/sales/:id",
	salesInvoice: "/sales/:id/print",
	supplies: "/supplies",
	suppliesDetail: "/supplies/:id",
	suppliesInvoice: "/supplies/:id/print",
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

/**
 * Partner detail deep-linked to the Транзакции tab, pre-filtered to outstanding
 * debt — the target when opening a partner from the Debts page (B13/DBT-1).
 */
export const partnerDebtPath = (id: number): string =>
	`${partnerDetailPath(id)}?tab=transactions&status=open`;

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

/** Detail route of a sale, supply or refund — a refund opens in its base document's module. */
export const transactionDetailPath = (type: TransactionType, id: number): string =>
	type === "Supply" || type === "SupplyRefund" ? supplyDetailPath(id) : saleDetailPath(id);

/** Printable invoice («Накладная») of a sale or sale refund. */
export const saleInvoicePath = (id: number): string => `${saleDetailPath(id)}/print`;

/** Printable invoice («Накладная») of a supply or supply refund. */
export const supplyInvoicePath = (id: number): string => `${supplyDetailPath(id)}/print`;

/** Printable invoice («Накладная») of an order. */
export const orderInvoicePath = (id: number): string => `${orderDetailPath(id)}/print`;

/**
 * Printable reconciliation statement («Акт сверки») of a partner. Without a
 * period the page opens on its default (start of the year → today).
 */
export const partnerStatementPath = (id: number, period?: { from: string; to: string }): string =>
	period
		? `${partnerDetailPath(id)}/statement?from=${period.from}&to=${period.to}`
		: `${partnerDetailPath(id)}/statement`;
