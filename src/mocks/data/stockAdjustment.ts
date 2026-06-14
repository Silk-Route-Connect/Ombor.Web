import {
	AdjustmentDirection,
	AdjustmentReason,
	StockAdjustment,
} from "../../models/stockAdjustment";
import { findProduct } from "./product";
import { findWarehouse } from "./warehouse";

/**
 * In-memory seed + mutation for the Stock Adjustments mock. No backend endpoint
 * exists, so the resource is mocked at the target v1 contract. Adjustments are
 * immutable (rule 23) — only list + create. Mutations persist within a session
 * and reset on reload.
 *
 * Cross-module consistency (seed-data rule 5): each adjustment references a real
 * product (Products mock) and warehouse (Warehouses mock); product name / SKU /
 * category / unit and the post-event balance are resolved from the served
 * product data. A created adjustment does NOT mutate the Products mock stock, so
 * it is not reflected on the Products / Warehouses pages — a known mock
 * limitation (consistent with the opening-stock flow); `balanceAfter` is the
 * arithmetic result of applying the delta to the current served quantity.
 */

const MS_PER_DAY = 86_400_000;
/** ISO date-time `daysAgo` days back, stamped at the given local hour:minute. */
function isoAt(daysAgo: number, hour: number, minute: number): string {
	const d = new Date(Date.now() - daysAgo * MS_PER_DAY);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}

/** Current served quantity of a product in a warehouse (hard rule 8). */
function availIn(productId: number, warehouseId: number): number {
	const product = findProduct(productId);
	return product?.inventoryItems.find((i) => i.inventoryId === warehouseId)?.quantity ?? 0;
}

type AdjustmentSeed = {
	productId: number;
	warehouseId: number;
	direction: AdjustmentDirection;
	quantity: number;
	reason: AdjustmentReason;
	note: string | null;
	createdBy: string;
	daysAgo: number;
	hour: number;
	minute: number;
};

const seed: AdjustmentSeed[] = [
	{
		productId: 1,
		warehouseId: 1,
		direction: "Decrease",
		quantity: 4,
		reason: "Damage",
		note: "Повреждение при транспортировке",
		createdBy: "Бахром Саидов",
		daysAgo: 3,
		hour: 14,
		minute: 20,
	},
	{
		productId: 3,
		warehouseId: 2,
		direction: "Decrease",
		quantity: 6,
		reason: "Theft",
		note: "Недостача по итогам смены",
		createdBy: "Дилноза Каримова",
		daysAgo: 6,
		hour: 11,
		minute: 5,
	},
	{
		productId: 5,
		warehouseId: 1,
		direction: "Increase",
		quantity: 2,
		reason: "RecountUp",
		note: "Расхождение при инвентаризации",
		createdBy: "Бахром Саидов",
		daysAgo: 9,
		hour: 16,
		minute: 40,
	},
	{
		productId: 8,
		warehouseId: 2,
		direction: "Decrease",
		quantity: 5,
		reason: "Damage",
		note: "Повреждение упаковки при разгрузке",
		createdBy: "Азиз Рустамов",
		daysAgo: 12,
		hour: 9,
		minute: 30,
	},
	{
		productId: 23,
		warehouseId: 1,
		direction: "Increase",
		quantity: 12,
		reason: "Found",
		note: "Найдено на дальнем стеллаже",
		createdBy: "Бахром Саидов",
		daysAgo: 14,
		hour: 13,
		minute: 15,
	},
	{
		productId: 11,
		warehouseId: 2,
		direction: "Decrease",
		quantity: 3,
		reason: "Damage",
		note: null,
		createdBy: "Дилноза Каримова",
		daysAgo: 18,
		hour: 10,
		minute: 50,
	},
	{
		productId: 20,
		warehouseId: 1,
		direction: "Decrease",
		quantity: 24,
		reason: "Expiry",
		note: "Истёк срок годности, партия от 12.04",
		createdBy: "Азиз Рустамов",
		daysAgo: 22,
		hour: 17,
		minute: 25,
	},
];

function build(specId: number, spec: AdjustmentSeed): StockAdjustment {
	const product = findProduct(spec.productId);
	const warehouse = findWarehouse(spec.warehouseId);
	return {
		id: specId,
		date: isoAt(spec.daysAgo, spec.hour, spec.minute),
		warehouseId: spec.warehouseId,
		warehouseName: warehouse?.name ?? `Склад #${spec.warehouseId}`,
		productId: spec.productId,
		productName: product?.name ?? `#${spec.productId}`,
		sku: product?.sku ?? "—",
		categoryName: product?.categoryName ?? null,
		measurement: product?.measurement ?? "Unit",
		direction: spec.direction,
		quantity: spec.quantity,
		reason: spec.reason,
		note: spec.note,
		createdBy: spec.createdBy,
		balanceAfter: availIn(spec.productId, spec.warehouseId),
	};
}

let adjustments: StockAdjustment[] = seed.map((spec, index) => build(seed.length - index, spec));
let nextId = seed.length + 1;

/** Newest first. */
export function listStockAdjustments(): StockAdjustment[] {
	return [...adjustments].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

export type StockAdjustmentWrite = {
	warehouseId: number;
	productId: number;
	direction: AdjustmentDirection;
	quantity: number;
	reason: AdjustmentReason;
	note: string | null;
};

/** Current availability — used by the handler to hard-block negative stock. */
export function availableStock(productId: number, warehouseId: number): number {
	return availIn(productId, warehouseId);
}

export function addStockAdjustment(write: StockAdjustmentWrite): StockAdjustment {
	const product = findProduct(write.productId);
	const warehouse = findWarehouse(write.warehouseId);
	const before = availIn(write.productId, write.warehouseId);
	const delta = write.direction === "Decrease" ? -write.quantity : write.quantity;

	const created: StockAdjustment = {
		id: nextId++,
		date: new Date().toISOString(),
		warehouseId: write.warehouseId,
		warehouseName: warehouse?.name ?? `Склад #${write.warehouseId}`,
		productId: write.productId,
		productName: product?.name ?? `#${write.productId}`,
		sku: product?.sku ?? "—",
		categoryName: product?.categoryName ?? null,
		measurement: product?.measurement ?? "Unit",
		direction: write.direction,
		quantity: write.quantity,
		reason: write.reason,
		note: write.note,
		createdBy: "Бахром Саидов",
		balanceAfter: before + delta,
	};
	adjustments = [created, ...adjustments];

	return created;
}
