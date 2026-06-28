import { ProductMovementKind } from "../../models/product";
import {
	OpeningStockLine,
	Warehouse,
	WarehouseMovement,
	WarehouseMovementKind,
	WarehouseStockItem,
} from "../../models/warehouse";
import {
	findProduct,
	listProductMovements,
	listProducts,
	listProductTransactions,
} from "./product";

/**
 * In-memory seed + mutation for the Warehouses mock. The redesigned «Склады»
 * pages need served aggregates (product count / units / stock value at WAC),
 * archive/restore, a per-warehouse stock view and a movements ledger — none of
 * which the stale `/api/inventories` contract provides — so the whole resource
 * is mocked here at the target v1 contract (docs/mocking.md). Mutations persist
 * within a session and reset on reload.
 *
 * Cross-module consistency (seed-data rule 5): warehouses 1 and 2 are the same
 * inventories the Products mock stocks into (`{1, 2}`), so each warehouse's
 * stock tab and movements ledger are DERIVED from the Products mock's served
 * data and reconcile exactly with every product's detail page. Warehouse 3 is
 * the archived warehouse with residual stock (business-rules rule 31) — the
 * Products mock references no inventory 3, so its holdings are a local overlay.
 * Opening-stock events add to the same overlay (the Products mock is not
 * mutated, so opening stock is not reflected on the Products page — a known mock
 * limitation; the design prototype likewise only toasted).
 */

type WarehouseSeed = {
	id: number;
	name: string;
	location: string | null;
	isArchived?: boolean;
};

const seed: WarehouseSeed[] = [
	{ id: 1, name: "Центральный склад", location: "ул. Навои 42, Ташкент" },
	{ id: 2, name: "Склад Чиланзар", location: "ул. Бунёдкор 15, Ташкент" },
	{ id: 3, name: "Архивный склад", location: "ул. Мирабад 8, Ташкент", isArchived: true },
];

let warehouses: WarehouseSeed[] = seed.map((w) => ({ ...w }));
let nextId = Math.max(...warehouses.map((w) => w.id)) + 1;

/**
 * Stock overlay keyed `warehouseId:productId` → absolute on-hand quantity and
 * WAC. Holds warehouse 3's residual stock and every opening-stock addition; it
 * supersedes the Products-mock-derived base for warehouses 1 and 2.
 */
type Holding = { quantity: number; averageCost: number };
const overrides = new Map<string, Holding>();

/** Local movement log (warehouse 3 openings + every opening-stock event). */
const localMovements = new Map<number, WarehouseMovement[]>();

const holdingKey = (warehouseId: number, productId: number) => `${warehouseId}:${productId}`;

const MS_PER_DAY = 86_400_000;
const isoDaysAgo = (daysAgo: number): string =>
	new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString();

/* ── Warehouse 3 residual stock + opening movements (rule 31 demonstration) ── */
function seedArchivedWarehouse(): void {
	const residual: Array<{
		productId: number;
		quantity: number;
		averageCost: number;
		daysAgo: number;
	}> = [
		{ productId: 2, quantity: 5, averageCost: 78000, daysAgo: 96 },
		{ productId: 6, quantity: 6, averageCost: 55000, daysAgo: 98 },
		{ productId: 13, quantity: 4, averageCost: 85000, daysAgo: 101 },
	];

	const movements: WarehouseMovement[] = [];
	residual.forEach((r, index) => {
		overrides.set(holdingKey(3, r.productId), {
			quantity: r.quantity,
			averageCost: r.averageCost,
		});
		const product = findProduct(r.productId);
		movements.push({
			id: 3_000_000 + index + 1,
			date: isoDaysAgo(r.daysAgo),
			kind: "Opening",
			productId: r.productId,
			productName: product?.name ?? `#${r.productId}`,
			measurement: product?.measurement ?? "Unit",
			counterparty: null,
			note: "Переход с Excel",
			quantity: r.quantity,
			balanceAfter: r.quantity,
		});
	});
	localMovements.set(3, movements);
}
seedArchivedWarehouse();

let nextMovementId = 9_000_000;

/* ───────────────────────────── stock (read) ───────────────────────────── */

// Product-movement kind → warehouse-movement kind. Covers the full served enum
// so a product movement of any kind maps cleanly.
const TXN_TO_MOVEMENT: Record<ProductMovementKind, WarehouseMovementKind> = {
	Sale: "Sale",
	Supply: "Supply",
	SaleRefund: "Refund",
	SupplyRefund: "Refund",
	Opening: "Opening",
	Transfer: "Transfer",
	Adjustment: "Adjustment",
};

/** Stock derived from the Products mock's per-warehouse inventory holdings. */
function derivedStock(warehouseId: number): Map<number, WarehouseStockItem> {
	const items = new Map<number, WarehouseStockItem>();
	for (const product of listProducts()) {
		const holding = product.warehouseItems.find((i) => i.warehouseId === warehouseId);
		if (!holding) {
			continue;
		}
		items.set(product.id, {
			productId: product.id,
			productName: product.name,
			sku: product.sku,
			categoryName: product.categoryName,
			measurement: product.measurement,
			quantity: holding.quantity,
			averageCost: holding.averageCost,
			value: holding.quantity * holding.averageCost,
		});
	}
	return items;
}

/** Apply the overlay (warehouse-3 seed + opening stock) on top of the base. */
export function listWarehouseStock(warehouseId: number): WarehouseStockItem[] {
	const base = derivedStock(warehouseId);

	for (const [key, holding] of overrides) {
		const [wid, pid] = key.split(":").map(Number);
		if (wid !== warehouseId) {
			continue;
		}
		const product = findProduct(pid);
		const existing = base.get(pid);
		base.set(pid, {
			productId: pid,
			productName: existing?.productName ?? product?.name ?? `#${pid}`,
			sku: existing?.sku ?? product?.sku ?? "—",
			categoryName: existing?.categoryName ?? product?.categoryName ?? null,
			measurement: existing?.measurement ?? product?.measurement ?? "Unit",
			quantity: holding.quantity,
			averageCost: holding.averageCost,
			value: holding.quantity * holding.averageCost,
		});
	}

	// The stock tab lists products actually on hand (design parity: qty > 0).
	return [...base.values()].filter((i) => i.quantity > 0).sort((a, b) => b.value - a.value);
}

function currentHolding(warehouseId: number, productId: number): Holding {
	const override = overrides.get(holdingKey(warehouseId, productId));
	if (override) {
		return override;
	}
	const product = findProduct(productId);
	const item = product?.warehouseItems.find((i) => i.warehouseId === warehouseId);
	return { quantity: item?.quantity ?? 0, averageCost: item?.averageCost ?? 0 };
}

/* ──────────────────────────── movements (read) ─────────────────────────── */

/**
 * Per-warehouse ledger derived from the Products mock. Each product's movements
 * in this warehouse are joined to its transactions (by shared id) for the
 * counterparty, and the per-warehouse running balance is reconstructed backward
 * from the product's current quantity in this warehouse — so the warehouse
 * ledger reconciles with the product detail page.
 */
function derivedMovements(warehouseId: number): WarehouseMovement[] {
	const result: WarehouseMovement[] = [];

	for (const product of listProducts()) {
		const productMovements = listProductMovements(product.id).filter(
			(m) => m.warehouseId === warehouseId,
		);
		if (productMovements.length === 0) {
			continue;
		}

		const partnerById = new Map(
			listProductTransactions(product.id).map((txn) => [txn.id, txn.partnerName]),
		);

		const holding = product.warehouseItems.find((i) => i.warehouseId === warehouseId);
		// productMovements are newest-first; the newest leaves the warehouse at its
		// current quantity. Step backward to recover each balanceAfter.
		let balance = holding?.quantity ?? 0;
		productMovements.forEach((movement, index) => {
			if (index > 0) {
				balance -= productMovements[index - 1].quantity;
			}
			result.push({
				id: movement.id,
				date: movement.date,
				kind: TXN_TO_MOVEMENT[movement.kind],
				productId: product.id,
				productName: product.name,
				measurement: product.measurement,
				counterparty: partnerById.get(movement.id) ?? null,
				note: null,
				quantity: movement.quantity,
				balanceAfter: balance,
			});
		});
	}

	return result;
}

export function listWarehouseMovements(warehouseId: number): WarehouseMovement[] {
	const merged = [...derivedMovements(warehouseId), ...(localMovements.get(warehouseId) ?? [])];
	// Newest first.
	return merged.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/* ───────────────────────────── aggregates ─────────────────────────────── */

function aggregate(warehouseId: number): {
	productCount: number;
	totalUnits: number;
	stockValue: number;
} {
	const stock = listWarehouseStock(warehouseId);
	return {
		productCount: stock.length,
		totalUnits: stock.reduce((sum, i) => sum + i.quantity, 0),
		stockValue: stock.reduce((sum, i) => sum + i.value, 0),
	};
}

function toWarehouse(seedRow: WarehouseSeed): Warehouse {
	const { productCount, totalUnits, stockValue } = aggregate(seedRow.id);
	return {
		id: seedRow.id,
		name: seedRow.name,
		location: seedRow.location,
		productCount,
		totalUnits,
		stockValue,
		isArchived: seedRow.isArchived ?? false,
	};
}

/* ───────────────────────────── queries ────────────────────────────────── */

export function listWarehouses(): Warehouse[] {
	return warehouses.map(toWarehouse);
}

export function findWarehouse(id: number): Warehouse | undefined {
	const row = warehouses.find((w) => w.id === id);
	return row ? toWarehouse(row) : undefined;
}

export function warehouseNameExists(name: string, exceptId?: number): boolean {
	const normalized = name.trim().toLowerCase();
	return warehouses.some((w) => w.id !== exceptId && w.name.trim().toLowerCase() === normalized);
}

/* ───────────────────────────── mutations ──────────────────────────────── */

export type WarehouseWrite = {
	name: string;
	location: string | null;
};

export function addWarehouse(write: WarehouseWrite): Warehouse {
	// Created empty: stock arrives later via the opening-stock flow (rule 22).
	const row: WarehouseSeed = {
		id: nextId++,
		name: write.name,
		location: write.location,
		isArchived: false,
	};
	warehouses = [...warehouses, row];
	return toWarehouse(row);
}

export function editWarehouse(id: number, write: WarehouseWrite): Warehouse | undefined {
	const row = warehouses.find((w) => w.id === id);
	if (!row) {
		return undefined;
	}
	row.name = write.name;
	row.location = write.location;
	return toWarehouse(row);
}

export function setWarehouseArchived(id: number, archived: boolean): Warehouse | undefined {
	const row = warehouses.find((w) => w.id === id);
	if (!row) {
		return undefined;
	}
	row.isArchived = archived;
	return toWarehouse(row);
}

/**
 * Record an opening-stock event: stock-in at the given unit cost, updating WAC
 * per the weighted-average formula (business-rules rule 18), and append an
 * audited Opening movement.
 */
export function addOpeningStock(
	id: number,
	items: OpeningStockLine[],
	note: string | null,
): Warehouse | undefined {
	const row = warehouses.find((w) => w.id === id);
	if (!row) {
		return undefined;
	}

	const movements = localMovements.get(id) ?? [];

	for (const line of items) {
		const before = currentHolding(id, line.productId);
		const totalQty = before.quantity + line.quantity;
		const weightedCost =
			totalQty > 0
				? Math.round(
						(before.quantity * before.averageCost + line.quantity * line.unitCost) / totalQty,
					)
				: line.unitCost;

		overrides.set(holdingKey(id, line.productId), {
			quantity: totalQty,
			averageCost: weightedCost,
		});

		const product = findProduct(line.productId);
		movements.unshift({
			id: ++nextMovementId,
			date: new Date().toISOString(),
			kind: "Opening",
			productId: line.productId,
			productName: product?.name ?? `#${line.productId}`,
			measurement: product?.measurement ?? "Unit",
			counterparty: null,
			note: note ?? "Начальный остаток",
			quantity: line.quantity,
			balanceAfter: totalQty,
		});
	}

	localMovements.set(id, movements);
	return toWarehouse(row);
}
