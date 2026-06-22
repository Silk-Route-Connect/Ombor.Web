import {
	DeliverOrderRequest,
	Order,
	OrderLine,
	OrderLineDiscountType,
	OrderStatus,
	UpdateOrderRequest,
} from "../../models/order";
import { findPartner } from "./partner";
import { findProduct } from "./product";
import { findWarehouse } from "./warehouse";

/**
 * In-memory seed + mutation for the Orders mock. An Order is the one MUTABLE
 * transaction: pending goods a customer asked for, before any stock or money has
 * moved. It walks Pending → Processing → Shipping → Delivered (Cancelled /
 * Rejected / Returned branches) and on Delivered promotes to an immutable Sale.
 *
 * The live `OrderDto` lacks the status history, the write-off warehouse, the
 * promoted-sale link, and per-line SKU/unit the redesign shows, so the whole
 * resource is mocked here at the target v1 contract (docs/mocking.md). Mutations
 * persist within a session and reset on reload.
 *
 * Cross-module consistency (seed-data rule 5): every line references a real
 * product (Products mock) and every order references a real customer (Partners
 * mock); names / SKU / unit / balance are resolved from the served data. The
 * delivery stock-check reads real product stock to block shortfalls (rule 20),
 * but promotion is SELF-CONTAINED — it records a sale reference on the order and
 * does NOT write the Sale into the Transactions mock or mutate product stock
 * (known mock limitation, consistent with refunds/transfers).
 */

const ME = "Бахром Саидов";
const BASE = new Date(2026, 5, 9); // 09.06.2026 — the seed "today"
const MS_PER_DAY = 86_400_000;

function isoAt(daysAgo: number, hour: number, minute: number): string {
	const d = new Date(BASE.getTime() - daysAgo * MS_PER_DAY);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}

/**
 * Date-only ISO ("YYYY-MM-DD") `daysAhead` from the real today (negative = past).
 * Delivery dates are forward-looking, so they anchor to the real current date —
 * this keeps the «overdue / upcoming» states meaningful whenever the demo runs.
 */
function isoDeliveryDate(daysAhead: number): string {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + daysAhead);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Current served stock of a product in a warehouse (hard rule 8). */
export function availableStock(productId: number, warehouseId: number): number {
	const product = findProduct(productId);
	return product?.warehouseItems.find((i) => i.warehouseId === warehouseId)?.quantity ?? 0;
}

type LineSpec = {
	productId: number;
	quantity: number;
	discount?: number;
	discountType?: OrderLineDiscountType;
};

type HistorySpec = { daysAgo: number; hour: number; minute: number; to: OrderStatus; by: string };

type OrderSeed = {
	id: number;
	customerId: number;
	source: Order["source"];
	status: OrderStatus;
	address: string | null;
	notes: string | null;
	/** Requested delivery date as days from today (positive = future, negative = past), or null. */
	deliveryDaysAhead?: number | null;
	/** Requested delivery time ("HH:mm"), or null. */
	deliveryTime?: string | null;
	warehouseId: number | null;
	saleId: number | null;
	lines: LineSpec[];
	history: HistorySpec[];
};

const seed: OrderSeed[] = [
	{
		id: 210,
		customerId: 1, // Антонина Давыдова
		source: "None",
		status: "Pending",
		address: "ул. Шота Руставели 14, Ташкент",
		notes: null,
		deliveryDaysAhead: 2,
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 1, quantity: 4 },
			{ productId: 8, quantity: 20 },
			{ productId: 13, quantity: 30 },
			{ productId: 6, quantity: 10 },
		],
		history: [{ daysAgo: 1, hour: 9, minute: 40, to: "Pending", by: ME }],
	},
	{
		id: 209,
		customerId: 4, // Виктория
		source: "Telegram",
		status: "Processing",
		address: "ул. Бабура 27, кв. 12, Ташкент",
		notes: "Доставить до 10 июня, позвонить за час",
		deliveryDaysAhead: 1,
		deliveryTime: "12:00",
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 3, quantity: 30 },
			{ productId: 5, quantity: 2, discount: 10, discountType: "Percentage" },
			{ productId: 9, quantity: 8 },
			{ productId: 2, quantity: 10 },
		],
		history: [
			{ daysAgo: 2, hour: 10, minute: 15, to: "Pending", by: ME },
			{ daysAgo: 2, hour: 14, minute: 30, to: "Processing", by: "Дилноза Каримова" },
		],
	},
	{
		id: 208,
		customerId: 8, // Дима Мирзадова
		source: "None",
		status: "Shipping",
		address: "ул. Навои 3, Самарканд",
		notes: null,
		deliveryDaysAhead: -1,
		deliveryTime: "10:00",
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 7, quantity: 3 },
			{ productId: 6, quantity: 5 },
			{ productId: 11, quantity: 6 },
		],
		history: [
			{ daysAgo: 3, hour: 11, minute: 5, to: "Pending", by: "Малика Юсупова" },
			{ daysAgo: 3, hour: 15, minute: 20, to: "Processing", by: ME },
			{ daysAgo: 2, hour: 9, minute: 10, to: "Shipping", by: ME },
		],
	},
	{
		id: 207,
		customerId: 7, // Геннадий Зайцев
		source: "Telegram",
		status: "Delivered",
		address: "ул. Амира Темура 88, Ташкент",
		notes: "Оплата при получении",
		deliveryDaysAhead: -2,
		deliveryTime: "14:00",
		warehouseId: 1,
		saleId: 1041,
		lines: [
			{ productId: 1, quantity: 5 },
			{ productId: 8, quantity: 30 },
			{ productId: 13, quantity: 15 },
			{ productId: 17, quantity: 5 },
		],
		history: [
			{ daysAgo: 4, hour: 13, minute: 25, to: "Pending", by: ME },
			{ daysAgo: 4, hour: 16, minute: 0, to: "Processing", by: ME },
			{ daysAgo: 3, hour: 10, minute: 30, to: "Shipping", by: "Дилноза Каримова" },
			{ daysAgo: 2, hour: 12, minute: 45, to: "Delivered", by: "Дилноза Каримова" },
		],
	},
	{
		id: 206,
		customerId: 6, // Виктория Собянина
		source: "None",
		status: "Cancelled",
		address: null,
		notes: "Клиент передумал — отменено по телефону",
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 7, quantity: 6 },
			{ productId: 1, quantity: 5 },
		],
		history: [
			{ daysAgo: 6, hour: 16, minute: 50, to: "Pending", by: "Малика Юсупова" },
			{ daysAgo: 5, hour: 9, minute: 15, to: "Cancelled", by: "Малика Юсупова" },
		],
	},
	{
		id: 205,
		customerId: 3, // Артём Орехников
		source: "OmborWeb",
		status: "Processing",
		address: "мкр. Юнусабад 4, д. 19, Ташкент",
		notes: "Самовывоз со склада",
		deliveryDaysAhead: 3,
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 1, quantity: 25 },
			{ productId: 8, quantity: 40 },
			{ productId: 9, quantity: 20 },
			{ productId: 7, quantity: 6 },
		],
		history: [
			{ daysAgo: 8, hour: 10, minute: 0, to: "Pending", by: "Заказ из OmborWeb" },
			{ daysAgo: 8, hour: 11, minute: 30, to: "Processing", by: ME },
		],
	},
	{
		id: 204,
		customerId: 4, // Виктория
		source: "Telegram",
		status: "Returned",
		address: "ул. Мукими 60, Ташкент",
		notes: "Часть товара возвращена — брак упаковки",
		warehouseId: 1,
		saleId: 1038,
		lines: [
			{ productId: 9, quantity: 10 },
			{ productId: 13, quantity: 20 },
		],
		history: [
			{ daysAgo: 9, hour: 14, minute: 10, to: "Pending", by: "Малика Юсупова" },
			{ daysAgo: 9, hour: 15, minute: 40, to: "Processing", by: "Малика Юсупова" },
			{ daysAgo: 8, hour: 9, minute: 50, to: "Shipping", by: ME },
			{ daysAgo: 7, hour: 11, minute: 20, to: "Delivered", by: ME },
			{ daysAgo: 5, hour: 16, minute: 5, to: "Returned", by: ME },
		],
	},
	{
		id: 203,
		customerId: 4, // Виктория
		source: "OmborWeb",
		status: "Rejected",
		address: "ул. Бабура 27, кв. 12, Ташкент",
		notes: "Клиент отклонил заказ в OmborWeb",
		warehouseId: null,
		saleId: null,
		lines: [
			{ productId: 7, quantity: 10 },
			{ productId: 5, quantity: 2 },
		],
		history: [
			{ daysAgo: 11, hour: 12, minute: 30, to: "Pending", by: "Заказ из OmborWeb" },
			{ daysAgo: 11, hour: 18, minute: 15, to: "Rejected", by: "Клиент (OmborWeb)" },
		],
	},
];

function buildLine(id: number, spec: LineSpec): OrderLine {
	const product = findProduct(spec.productId);
	const unitPrice = product?.salePrice ?? 0;
	const discount = spec.discount ?? 0;
	const discountType: OrderLineDiscountType = spec.discountType ?? "Percentage";
	const gross = spec.quantity * unitPrice;
	const discountAmount = discount
		? discountType === "Percentage"
			? Math.round((gross * discount) / 100)
			: Math.min(discount, gross)
		: 0;

	return {
		id,
		productId: spec.productId,
		productName: product?.name ?? `#${spec.productId}`,
		sku: product?.sku ?? "—",
		measurement: product?.measurement ?? "Unit",
		quantity: spec.quantity,
		unitPrice,
		discount,
		discountType,
		total: gross - discountAmount,
	};
}

function build(spec: OrderSeed): Order {
	const lines = spec.lines.map((line, index) => buildLine(index + 1, line));
	const partner = findPartner(spec.customerId);
	const history = spec.history.map((h) => {
		const reached = spec.history.filter(
			(x) => x.daysAgo > h.daysAgo || (x.daysAgo === h.daysAgo && x.minute < h.minute),
		);
		const prev = reached.length > 0 ? reached[reached.length - 1].to : null;
		return { at: isoAt(h.daysAgo, h.hour, h.minute), from: prev, to: h.to, by: h.by };
	});

	return {
		id: spec.id,
		orderNumber: String(spec.id),
		customerId: spec.customerId,
		customerName: partner?.name ?? `#${spec.customerId}`,
		customerType: partner?.type ?? "Customer",
		customerBalance: partner?.balance ?? 0,
		date: history[0]?.at ?? isoAt(1, 9, 0),
		status: spec.status,
		source: spec.source,
		deliveryAddress: spec.address,
		deliveryDate: spec.deliveryDaysAhead == null ? null : isoDeliveryDate(spec.deliveryDaysAhead),
		deliveryTime: spec.deliveryTime ?? null,
		notes: spec.notes,
		warehouseId: spec.warehouseId,
		warehouseName: spec.warehouseId ? (findWarehouse(spec.warehouseId)?.name ?? null) : null,
		saleId: spec.saleId,
		total: lines.reduce((s, l) => s + l.total, 0),
		lines,
		history,
	};
}

let orders: Order[] = seed.map(build);
let nextSaleId = 1042;
let nextItemId = 1000;

const now = (): string => new Date().toISOString();

/** Filtered list: search matches order number or customer; status narrows one state. Newest first. */
export function listOrders(searchTerm?: string | null, status?: OrderStatus | null): Order[] {
	let result = [...orders];

	if (status) {
		result = result.filter((o) => o.status === status);
	}

	const term = searchTerm?.trim().toLowerCase();
	if (term) {
		result = result.filter(
			(o) =>
				`#${o.orderNumber}`.toLowerCase().includes(term) ||
				o.customerName.toLowerCase().includes(term),
		);
	}

	return result.sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || b.id - a.id);
}

export function findOrder(id: number): Order | undefined {
	return orders.find((o) => o.id === id);
}

function patch(id: number, mutate: (order: Order) => Order): Order | undefined {
	const existing = findOrder(id);
	if (!existing) {
		return undefined;
	}
	const updated = mutate(existing);
	orders = orders.map((o) => (o.id === id ? updated : o));
	return updated;
}

/** Append a status-history event and move the order to `to`. */
function transition(id: number, to: OrderStatus, by: string): Order | undefined {
	return patch(id, (order) => ({
		...order,
		status: to,
		history: [...order.history, { at: now(), from: order.status, to, by }],
	}));
}

export function processOrder(id: number): Order | undefined {
	return transition(id, "Processing", ME);
}

export function shipOrder(id: number): Order | undefined {
	return transition(id, "Shipping", ME);
}

export function cancelOrder(id: number): Order | undefined {
	return transition(id, "Cancelled", ME);
}

export function rejectOrder(id: number): Order | undefined {
	return transition(id, "Rejected", "Клиент");
}

export function returnOrder(id: number): Order | undefined {
	return transition(id, "Returned", ME);
}

/** Per-line stock check of an order against a candidate warehouse. */
export function checkOrderStock(
	order: Order,
	warehouseId: number,
): Array<{ productId: number; productName: string; need: number; have: number; ok: boolean }> {
	return order.lines.map((l) => {
		const have = availableStock(l.productId, warehouseId);
		return {
			productId: l.productId,
			productName: l.productName,
			need: l.quantity,
			have,
			ok: l.quantity <= have,
		};
	});
}

export type DeliverResult =
	| { ok: true; order: Order }
	| { ok: false; status: number; errors: Record<string, string[]> };

/**
 * Deliver → promote to a Sale against the chosen warehouse. Hard-blocks on any
 * line over stock (rule 20). Self-contained: assigns a sale reference + sets the
 * warehouse, but does not write a Sale into the Transactions mock or debit stock.
 */
export function deliverOrder(request: DeliverOrderRequest): DeliverResult {
	const order = findOrder(request.id);
	if (!order) {
		return { ok: false, status: 404, errors: {} };
	}

	const warehouse = findWarehouse(request.warehouseId);
	if (!warehouse) {
		return { ok: false, status: 400, errors: { warehouseId: ["Выберите склад"] } };
	}

	const checks = checkOrderStock(order, request.warehouseId);
	const short = checks.filter((c) => !c.ok);
	if (short.length > 0) {
		return {
			ok: false,
			status: 400,
			errors: {
				lines: short.map(
					(c) => `Недостаточно «${c.productName}»: доступно ${c.have}, в заказе ${c.need}`,
				),
			},
		};
	}

	const saleId = nextSaleId++;
	const updated = patch(request.id, (o) => ({
		...o,
		status: "Delivered",
		warehouseId: warehouse.id,
		warehouseName: warehouse.name,
		saleId,
		history: [...o.history, { at: now(), from: o.status, to: "Delivered", by: ME }],
	}));

	return { ok: true, order: updated! };
}

export function updateOrder(id: number, request: UpdateOrderRequest): Order | undefined {
	const partner = findPartner(request.customerId);
	const lines = request.lines.map((line) =>
		buildLine(nextItemId++, {
			productId: line.productId,
			quantity: line.quantity,
			discount: line.discount,
			discountType: line.discountType,
		}),
	);
	// Honour the edited unit price (buildLine resolves the catalogue price).
	const priced = lines.map((l, i) => {
		const gross = request.lines[i].quantity * request.lines[i].unitPrice;
		const disc = request.lines[i].discount;
		const discAmount = disc
			? request.lines[i].discountType === "Percentage"
				? Math.round((gross * disc) / 100)
				: Math.min(disc, gross)
			: 0;
		return { ...l, unitPrice: request.lines[i].unitPrice, total: gross - discAmount };
	});

	return patch(id, (order) => ({
		...order,
		customerId: request.customerId,
		customerName: partner?.name ?? order.customerName,
		customerType: partner?.type ?? order.customerType,
		customerBalance: partner?.balance ?? order.customerBalance,
		source: request.source,
		deliveryAddress: request.deliveryAddress ?? null,
		deliveryDate: request.deliveryDate ?? null,
		deliveryTime: request.deliveryTime ?? null,
		notes: request.notes ?? null,
		lines: priced,
		total: priced.reduce((s, l) => s + l.total, 0),
	}));
}
