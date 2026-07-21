import { CreateTransferLine, Transfer, TransferLine } from "../../models/transfer";
import { findProduct } from "./product";
import { findWarehouse } from "./warehouse";

/**
 * In-memory seed + mutation for the Transfers mock. The redesigned «Перемещения»
 * page needs the author and per-line unit the backend DTO lacks, so the resource
 * is mocked at the target v1 contract (docs/mocking.md). Mutations persist within
 * a session and reset on reload.
 *
 * Cross-module consistency (seed-data rule 5): every line references a real
 * product (Products mock) and the route references real warehouses (Warehouses
 * mock); product name / SKU / unit and warehouse names are resolved from the
 * served data. A created transfer does NOT mutate the Products mock stock, so it
 * is not reflected on the Products / Warehouses pages — a known mock limitation
 * (consistent with the opening-stock and adjustment flows).
 */

const MS_PER_DAY = 86_400_000;
function isoAt(daysAgo: number, hour: number, minute: number): string {
	const d = new Date(Date.now() - daysAgo * MS_PER_DAY);
	d.setHours(hour, minute, 0, 0);
	return d.toISOString();
}

/** Current served quantity of a product in a warehouse (hard rule 8). */
function availIn(productId: number, warehouseId: number): number {
	const product = findProduct(productId);
	return product?.warehouseItems.find((i) => i.warehouseId === warehouseId)?.quantity ?? 0;
}

type TransferSeed = {
	fromWarehouseId: number;
	toWarehouseId: number;
	createdBy: string;
	note: string | null;
	daysAgo: number;
	hour: number;
	minute: number;
	lines: CreateTransferLine[];
};

const seed: TransferSeed[] = [
	{
		fromWarehouseId: 1,
		toWarehouseId: 2,
		createdBy: "Бахром Саидов",
		note: "Пополнение филиала перед выходными",
		daysAgo: 2,
		hour: 15,
		minute: 10,
		lines: [
			{ productId: 1, quantity: 20 },
			{ productId: 3, quantity: 50 },
			{ productId: 5, quantity: 8 },
		],
	},
	{
		fromWarehouseId: 2,
		toWarehouseId: 1,
		createdBy: "Дилноза Каримова",
		note: null,
		daysAgo: 7,
		hour: 12,
		minute: 35,
		lines: [{ productId: 8, quantity: 15 }],
	},
	{
		fromWarehouseId: 1,
		toWarehouseId: 2,
		createdBy: "Азиз Рустамов",
		note: "Перераспределение остатков",
		daysAgo: 13,
		hour: 10,
		minute: 20,
		lines: [
			{ productId: 3, quantity: 30 },
			{ productId: 17, quantity: 12 },
		],
	},
	{
		fromWarehouseId: 2,
		toWarehouseId: 1,
		createdBy: "Бахром Саидов",
		note: null,
		daysAgo: 20,
		hour: 9,
		minute: 5,
		lines: [
			{ productId: 11, quantity: 6 },
			{ productId: 19, quantity: 20 },
		],
	},
];

function buildLine(line: CreateTransferLine): TransferLine {
	const product = findProduct(line.productId);
	return {
		productId: line.productId,
		productName: product?.name ?? `#${line.productId}`,
		sku: product?.sku ?? "—",
		measurement: product?.measurement ?? "Unit",
		quantity: line.quantity,
	};
}

function build(id: number, spec: TransferSeed): Transfer {
	return {
		id,
		date: isoAt(spec.daysAgo, spec.hour, spec.minute),
		fromWarehouseId: spec.fromWarehouseId,
		fromWarehouseName:
			findWarehouse(spec.fromWarehouseId)?.name ?? `Склад #${spec.fromWarehouseId}`,
		toWarehouseId: spec.toWarehouseId,
		toWarehouseName: findWarehouse(spec.toWarehouseId)?.name ?? `Склад #${spec.toWarehouseId}`,
		note: spec.note,
		createdBy: spec.createdBy,
		lines: spec.lines.map(buildLine),
	};
}

let transfers: Transfer[] = seed.map((spec, index) => build(seed.length - index, spec));
let nextId = seed.length + 1;

/** Newest first. */
export function listTransfers(): Transfer[] {
	return [...transfers].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/** Current availability — used by the handler to hard-block negative stock. */
export function availableStock(productId: number, warehouseId: number): number {
	return availIn(productId, warehouseId);
}

export type TransferWrite = {
	fromWarehouseId: number;
	toWarehouseId: number;
	note: string | null;
	lines: CreateTransferLine[];
};

export function addTransfer(write: TransferWrite): Transfer {
	const created: Transfer = {
		id: nextId++,
		date: new Date().toISOString(),
		fromWarehouseId: write.fromWarehouseId,
		fromWarehouseName:
			findWarehouse(write.fromWarehouseId)?.name ?? `Склад #${write.fromWarehouseId}`,
		toWarehouseId: write.toWarehouseId,
		toWarehouseName: findWarehouse(write.toWarehouseId)?.name ?? `Склад #${write.toWarehouseId}`,
		note: write.note,
		createdBy: "Бахром Саидов",
		lines: write.lines.map(buildLine),
	};
	transfers = [created, ...transfers];

	return created;
}
