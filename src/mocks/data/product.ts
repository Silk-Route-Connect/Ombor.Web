import {
	Measurement,
	Product,
	ProductImage,
	ProductMovement,
	ProductPackaging,
	ProductTransaction,
	ProductType,
	ProductWarehouseItem,
} from "../../models/product";
import {
	adjustCategoryProductCount,
	findCategory,
	listCategories,
	setCategoryProductCount,
} from "./category";

/**
 * In-memory seed + mutation for the Products mock. The whole Products resource
 * is mocked at the target v1 contract because the real endpoint is stale at the
 * page level (writable QuantityInStock, no served stock/WAC aggregates, hard
 * delete instead of pure archive). Mutations persist within a session and reset
 * on reload (docs/mocking.md).
 *
 * Cross-module consistency (seed-data rule 5): `categoryId`s reference the
 * mocked Categories seed (ids 1–20) by id, and `categoryName` is resolved from
 * it so the two never drift. After seeding — and on every create/edit/archive/
 * restore — each category's `productCount` is recomputed from the active
 * (non-archived) products referencing it, so the Categories page stays exact.
 *
 * Served aggregates (hard rule 8): `totalStock` is computed here from
 * `warehouseItems`, never on the client. Per-warehouse `averageCost` stays on
 * the inventory items (the detail page consumes it); the product-level WAC
 * aggregate was dropped from the list contract (decision 2026-06-12).
 */

/** The two seeded warehouses (mirrors the design's Inventories). */
const WAREHOUSES: Record<number, string> = {
	1: "Центральный склад",
	2: "Склад Чиланзар",
};

type StockSpec = { warehouseId: number; quantity: number; averageCost: number };

type ProductSeed = {
	id: number;
	categoryId: number | null;
	name: string;
	sku: string;
	barcode?: string;
	description?: string;
	salePrice: number;
	supplyPrice: number;
	retailPrice: number;
	measurement: Measurement;
	type: ProductType;
	lowStockThreshold?: number | null;
	isArchived?: boolean;
	packaging?: ProductPackaging;
	stock?: StockSpec[];
	/** Two-color gradient placeholder image (seed-only stand-in for real photos). */
	imageColors?: [string, string];
};

/**
 * Inline SVG product photo stand-in (gradient tile) so the list shows the
 * image-thumbnail state without bundling binary assets. Session uploads still
 * produce object URLs (see handlers/product.ts buildImages).
 */
function seedImage(id: number, name: string, [from, to]: [string, string]): ProductImage {
	const initial = name.trim().charAt(0).toUpperCase();
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">` +
		`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
		`<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
		`</linearGradient></defs>` +
		`<rect width="96" height="96" fill="url(#g)"/>` +
		`<text x="48" y="60" font-family="sans-serif" font-size="38" font-weight="700" ` +
		`fill="rgba(255,255,255,.85)" text-anchor="middle">${initial}</text></svg>`;
	const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

	return { id, name: `${name}.svg`, originalUrl: url, thumbnailUrl: url };
}

const seed: ProductSeed[] = [
	// ── Электроника (1) ──────────────────────────────────────────────────────
	{
		id: 1,
		categoryId: 1,
		name: "Наушники беспроводные TWS",
		sku: "SKU-10001",
		barcode: "4780100100015",
		description: "Беспроводные наушники с активным шумоподавлением и зарядным кейсом.",
		salePrice: 145000,
		supplyPrice: 95000,
		retailPrice: 159000,
		measurement: "Unit",
		type: "All",
		imageColors: ["#2F4858", "#5B7B8C"],
		stock: [
			{ warehouseId: 1, quantity: 60, averageCost: 96000 },
			{ warehouseId: 2, quantity: 25, averageCost: 97500 },
		],
	},
	{
		id: 2,
		categoryId: 1,
		name: "Зарядное устройство 65 Вт USB-C",
		sku: "SKU-10002",
		barcode: "4780100100022",
		salePrice: 120000,
		supplyPrice: 78000,
		retailPrice: 132000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 40, averageCost: 79000 }],
	},
	{
		id: 3,
		categoryId: 1,
		name: "Кабель USB-C — USB-C, 1 м",
		sku: "SKU-10003",
		barcode: "4780100100039",
		salePrice: 32000,
		supplyPrice: 18000,
		retailPrice: 35000,
		measurement: "Unit",
		type: "All",
		lowStockThreshold: 100,
		packaging: { size: 50, label: "Коробка 50 шт", barcode: "4780100100046" },
		stock: [
			{ warehouseId: 1, quantity: 200, averageCost: 18200 },
			{ warehouseId: 2, quantity: 140, averageCost: 18500 },
		],
	},
	{
		id: 4,
		categoryId: 1,
		name: "Внешний аккумулятор 20000 мА·ч",
		sku: "SKU-10004",
		salePrice: 195000,
		supplyPrice: 130000,
		retailPrice: 210000,
		measurement: "Unit",
		type: "All",
		lowStockThreshold: 25,
		stock: [{ warehouseId: 1, quantity: 18, averageCost: 131000 }],
	},
	// ── Компьютеры (10) ──────────────────────────────────────────────────────
	{
		id: 5,
		categoryId: 10,
		name: "SSD-накопитель 1 ТБ NVMe",
		sku: "SKU-10005",
		barcode: "4780100100053",
		salePrice: 580000,
		supplyPrice: 420000,
		retailPrice: 620000,
		measurement: "Unit",
		type: "All",
		imageColors: ["#1D3557", "#457B9D"],
		stock: [
			{ warehouseId: 1, quantity: 30, averageCost: 425000 },
			{ warehouseId: 2, quantity: 12, averageCost: 430000 },
		],
	},
	{
		id: 6,
		categoryId: 10,
		name: "Мышь беспроводная эргономичная",
		sku: "SKU-10006",
		salePrice: 89000,
		supplyPrice: 55000,
		retailPrice: 95000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 75, averageCost: 56000 }],
	},
	{
		id: 7,
		categoryId: 10,
		name: "Клавиатура механическая RGB",
		sku: "SKU-10007",
		salePrice: 350000,
		supplyPrice: 240000,
		retailPrice: 380000,
		measurement: "Unit",
		type: "All",
		// zero stock — just defined, never supplied yet
		stock: [],
	},
	// ── Одежда (6) ───────────────────────────────────────────────────────────
	{
		id: 8,
		categoryId: 6,
		name: "Футболка хлопковая базовая",
		sku: "SKU-10008",
		barcode: "4780100100060",
		salePrice: 69000,
		supplyPrice: 38000,
		retailPrice: 75000,
		measurement: "Unit",
		type: "All",
		imageColors: ["#6B4A2B", "#8A5A30"],
		stock: [
			{ warehouseId: 1, quantity: 120, averageCost: 38500 },
			{ warehouseId: 2, quantity: 80, averageCost: 39000 },
		],
	},
	{
		id: 9,
		categoryId: 6,
		name: "Джинсы прямого кроя, синие",
		sku: "SKU-10009",
		salePrice: 230000,
		supplyPrice: 145000,
		retailPrice: 245000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 45, averageCost: 147000 }],
	},
	{
		id: 10,
		categoryId: 6,
		name: "Куртка демисезонная",
		sku: "SKU-10010",
		salePrice: 480000,
		supplyPrice: 320000,
		retailPrice: 510000,
		measurement: "Unit",
		type: "All",
		lowStockThreshold: 30,
		stock: [{ warehouseId: 1, quantity: 22, averageCost: 322000 }],
	},
	// ── Обувь (4) ────────────────────────────────────────────────────────────
	{
		id: 11,
		categoryId: 4,
		name: "Кроссовки беговые",
		sku: "SKU-10011",
		barcode: "4780100100077",
		salePrice: 420000,
		supplyPrice: 280000,
		retailPrice: 450000,
		measurement: "Unit",
		type: "All",
		imageColors: ["#264653", "#2A9D8F"],
		stock: [
			{ warehouseId: 1, quantity: 38, averageCost: 283000 },
			{ warehouseId: 2, quantity: 17, averageCost: 286000 },
		],
	},
	{
		id: 12,
		categoryId: 4,
		name: "Ботинки кожаные зимние",
		sku: "SKU-10012",
		salePrice: 590000,
		supplyPrice: 410000,
		retailPrice: 630000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 12, averageCost: 415000 }],
	},
	// ── Книги (17) ───────────────────────────────────────────────────────────
	{
		id: 13,
		categoryId: 17,
		name: "Книга «Чистый код»",
		sku: "SKU-10013",
		barcode: "4780100100084",
		salePrice: 135000,
		supplyPrice: 85000,
		retailPrice: 145000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 60, averageCost: 86000 }],
	},
	{
		id: 14,
		categoryId: 17,
		name: "Книга «Атлас облаков»",
		sku: "SKU-10014",
		description: "Издание только на продажу — без закупочной цены.",
		salePrice: 95000,
		supplyPrice: 0,
		retailPrice: 105000,
		measurement: "Unit",
		type: "Sale",
		stock: [{ warehouseId: 1, quantity: 40, averageCost: 72000 }],
	},
	{
		id: 15,
		categoryId: 17,
		name: "Книга «Война и мир» (2 тома)",
		sku: "SKU-10015",
		salePrice: 98000,
		supplyPrice: 60000,
		retailPrice: 108000,
		measurement: "Unit",
		type: "All",
		// sold out: zero quantity at both warehouses, history exists
		stock: [
			{ warehouseId: 1, quantity: 0, averageCost: 60000 },
			{ warehouseId: 2, quantity: 0, averageCost: 60000 },
		],
	},
	// ── Фильмы (2) ───────────────────────────────────────────────────────────
	{
		id: 16,
		categoryId: 2,
		name: "Фильм «Дюна» Blu-ray",
		sku: "SKU-10016",
		salePrice: 75000,
		supplyPrice: 0,
		retailPrice: 82000,
		measurement: "Unit",
		type: "Sale",
		stock: [{ warehouseId: 1, quantity: 55, averageCost: 52000 }],
	},
	// ── Игрушки (7) ──────────────────────────────────────────────────────────
	{
		id: 17,
		categoryId: 7,
		name: "Конструктор-кубики, 200 деталей",
		sku: "SKU-10017",
		barcode: "4780100100091",
		salePrice: 110000,
		supplyPrice: 65000,
		retailPrice: 120000,
		measurement: "Unit",
		type: "All",
		imageColors: ["#E76F51", "#F4A261"],
		packaging: { size: 12, label: "Коробка 12 шт", barcode: null },
		stock: [
			{ warehouseId: 1, quantity: 80, averageCost: 66000 },
			{ warehouseId: 2, quantity: 40, averageCost: 67000 },
		],
	},
	{
		id: 18,
		categoryId: 7,
		name: "Плюшевый медведь, 40 см",
		sku: "SKU-10018",
		salePrice: 89000,
		supplyPrice: 48000,
		retailPrice: 95000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 35, averageCost: 49000 }],
	},
	// ── Детское (20) ─────────────────────────────────────────────────────────
	{
		id: 19,
		categoryId: 20,
		name: "Подгузники, размер 3 (упаковка)",
		sku: "SKU-10019",
		barcode: "4780100100107",
		salePrice: 165000,
		supplyPrice: 110000,
		retailPrice: 175000,
		measurement: "Unit",
		type: "All",
		stock: [
			{ warehouseId: 1, quantity: 90, averageCost: 111000 },
			{ warehouseId: 2, quantity: 60, averageCost: 112000 },
		],
	},
	{
		id: 20,
		categoryId: 20,
		name: "Детское пюре «Яблоко», 200 г",
		sku: "SKU-10020",
		salePrice: 19000,
		supplyPrice: 12000,
		retailPrice: 21000,
		measurement: "Gram",
		type: "All",
		packaging: { size: 24, label: "Коробка 24 шт", barcode: null },
		stock: [{ warehouseId: 1, quantity: 300, averageCost: 12200 }],
	},
	// ── Дом (13) ─────────────────────────────────────────────────────────────
	{
		id: 21,
		categoryId: 13,
		name: "Набор полотенец, 3 шт",
		sku: "SKU-10021",
		salePrice: 120000,
		supplyPrice: 72000,
		retailPrice: 130000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 50, averageCost: 73000 }],
	},
	{
		id: 22,
		categoryId: 13,
		name: "Сковорода антипригарная, 28 см",
		sku: "SKU-10022",
		salePrice: 155000,
		supplyPrice: 95000,
		retailPrice: 168000,
		measurement: "Unit",
		type: "All",
		stock: [
			{ warehouseId: 1, quantity: 28, averageCost: 96000 },
			{ warehouseId: 2, quantity: 15, averageCost: 97000 },
		],
	},
	{
		id: 23,
		categoryId: 13,
		name: "Стиральный порошок, 3 кг",
		sku: "SKU-10023",
		barcode: "4780100100114",
		salePrice: 79000,
		supplyPrice: 48000,
		retailPrice: 86000,
		measurement: "Kilogram",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 64, averageCost: 48500 }],
	},
	// ── Красота (16) ─────────────────────────────────────────────────────────
	{
		id: 24,
		categoryId: 16,
		name: "Крем для рук увлажняющий, 75 мл",
		sku: "SKU-10024",
		salePrice: 39000,
		supplyPrice: 22000,
		retailPrice: 43000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 140, averageCost: 22500 }],
	},
	{
		id: 25,
		categoryId: 16,
		name: "Шампунь восстанавливающий, 400 мл",
		sku: "SKU-10025",
		salePrice: 54000,
		supplyPrice: 31000,
		retailPrice: 59000,
		measurement: "Piece",
		type: "All",
		lowStockThreshold: 120,
		imageColors: ["#7A5230", "#A06A38"],
		stock: [{ warehouseId: 1, quantity: 95, averageCost: 31500 }],
	},
	// ── Здоровье (11) ────────────────────────────────────────────────────────
	{
		id: 26,
		categoryId: 11,
		name: "Витамин C 1000 мг, 60 таблеток",
		sku: "SKU-10026",
		salePrice: 78000,
		supplyPrice: 45000,
		retailPrice: 85000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 70, averageCost: 45500 }],
	},
	// ── Музыка (9) ───────────────────────────────────────────────────────────
	{
		id: 27,
		categoryId: 9,
		name: "Струны для акустической гитары",
		sku: "SKU-10027",
		salePrice: 65000,
		supplyPrice: 38000,
		retailPrice: 70000,
		measurement: "Unit",
		type: "All",
		stock: [{ warehouseId: 1, quantity: 42, averageCost: 38500 }],
	},
	// ── No category — supply-only consumable ────────────────────────────────
	{
		id: 28,
		categoryId: null,
		name: "Подарочная упаковка (рулон)",
		sku: "SKU-10028",
		description: "Расходник для отдела упаковки — только закупка.",
		salePrice: 0,
		supplyPrice: 15000,
		retailPrice: 0,
		measurement: "Unit",
		type: "Supply",
		stock: [{ warehouseId: 1, quantity: 80, averageCost: 15200 }],
	},
	// ── Archived samples (hidden by default; revealed by the «Архив» toggle) ──
	{
		id: 29,
		categoryId: 1,
		name: "Наушники проводные (снято с продажи)",
		sku: "SKU-10029",
		salePrice: 45000,
		supplyPrice: 25000,
		retailPrice: 49000,
		measurement: "Unit",
		type: "All",
		isArchived: true,
		stock: [{ warehouseId: 1, quantity: 30, averageCost: 25500 }],
	},
	{
		id: 30,
		categoryId: 6,
		name: "Шорты пляжные (прошлая коллекция)",
		sku: "SKU-10030",
		salePrice: 49000,
		supplyPrice: 28000,
		retailPrice: 53000,
		measurement: "Unit",
		type: "All",
		isArchived: true,
		stock: [],
	},
];

function warehouseName(warehouseId: number): string {
	return WAREHOUSES[warehouseId] ?? `Склад #${warehouseId}`;
}

function toInventoryItems(stock: StockSpec[]): ProductWarehouseItem[] {
	return stock.map((s) => ({
		warehouseId: s.warehouseId,
		warehouseName: warehouseName(s.warehouseId),
		quantity: s.quantity,
		averageCost: s.averageCost,
	}));
}

/** Served aggregates: total quantity and value-weighted WAC across warehouses
 * (hard rule 8). The WAC aggregate is surfaced on the detail page only. */
function aggregate(items: ProductWarehouseItem[]): {
	totalStock: number;
	averageCost: number | null;
} {
	const totalStock = items.reduce((sum, i) => sum + i.quantity, 0);
	if (totalStock <= 0) {
		return { totalStock, averageCost: null };
	}

	const totalValue = items.reduce((sum, i) => sum + i.quantity * i.averageCost, 0);
	return { totalStock, averageCost: Math.round(totalValue / totalStock) };
}

function buildProduct(spec: ProductSeed): Product {
	const items = toInventoryItems(spec.stock ?? []);
	const { totalStock, averageCost } = aggregate(items);
	const lowStockThreshold = spec.lowStockThreshold ?? null;

	return {
		id: spec.id,
		categoryId: spec.categoryId,
		categoryName: spec.categoryId != null ? (findCategory(spec.categoryId)?.name ?? null) : null,
		name: spec.name,
		sku: spec.sku,
		description: spec.description,
		barcode: spec.barcode,
		salePrice: spec.salePrice,
		supplyPrice: spec.supplyPrice,
		retailPrice: spec.retailPrice,
		measurement: spec.measurement,
		type: spec.type,
		lowStockThreshold,
		isLowStock: lowStockThreshold != null && totalStock <= lowStockThreshold,
		isArchived: spec.isArchived ?? false,
		packaging: spec.packaging,
		images: spec.imageColors ? [seedImage(spec.id * 100 + 1, spec.name, spec.imageColors)] : [],
		warehouseItems: items,
		totalStock,
		averageCost,
	};
}

let products: Product[] = seed.map(buildProduct);
// Created products get ids after the seeded range.
let nextId = Math.max(...products.map((p) => p.id)) + 1;

/** Recompute every category's productCount from active products referencing it. */
function syncAllCategoryCounts(): void {
	const counts = new Map<number, number>();
	for (const p of products) {
		if (p.isArchived || p.categoryId == null) {
			continue;
		}
		counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);
	}
	for (const category of listCategories()) {
		setCategoryProductCount(category.id, counts.get(category.id) ?? 0);
	}
}

// Make the Categories page exact from the first render.
syncAllCategoryCounts();

export function listProducts(): Product[] {
	return products;
}

export function findProduct(id: number): Product | undefined {
	return products.find((p) => p.id === id);
}

export function skuExists(sku: string, exceptId?: number): boolean {
	const normalized = sku.trim().toLowerCase();
	return products.some((p) => p.id !== exceptId && p.sku.trim().toLowerCase() === normalized);
}

/** Resolve a category id to its current name (or null when unset/missing). */
function resolveCategoryName(categoryId: number | null): string | null {
	return categoryId != null ? (findCategory(categoryId)?.name ?? null) : null;
}

export type ProductWrite = {
	categoryId: number | null;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;
	salePrice: number;
	supplyPrice: number;
	measurement: Product["measurement"];
	type: Product["type"];
	lowStockThreshold?: number | null;
	packaging?: ProductPackaging;
	images: Product["images"];
};

export function addProduct(write: ProductWrite): Product {
	// Created at zero stock: stock arrives later via an opening-stock event
	// (canon rule 22), not at product definition.
	const created: Product = {
		id: nextId++,
		categoryId: write.categoryId,
		categoryName: resolveCategoryName(write.categoryId),
		name: write.name,
		sku: write.sku,
		description: write.description,
		barcode: write.barcode,
		salePrice: write.salePrice,
		supplyPrice: write.supplyPrice,
		// retailPrice is no longer collected by the create/edit form (dropped from
		// the contract); kept as a dormant field on the record, created at 0.
		retailPrice: 0,
		measurement: write.measurement,
		type: write.type,
		lowStockThreshold: write.lowStockThreshold ?? null,
		isLowStock: false,
		isArchived: false,
		packaging: write.packaging,
		images: write.images,
		warehouseItems: [],
		totalStock: 0,
		averageCost: null,
	};
	products = [created, ...products];

	if (created.categoryId != null) {
		adjustCategoryProductCount(created.categoryId, 1);
	}

	return created;
}

export function editProduct(id: number, write: ProductWrite): Product | undefined {
	const existing = findProduct(id);
	if (!existing) {
		return undefined;
	}

	const previousCategoryId = existing.categoryId;

	existing.categoryId = write.categoryId;
	existing.categoryName = resolveCategoryName(write.categoryId);
	existing.name = write.name;
	existing.sku = write.sku;
	existing.description = write.description;
	existing.barcode = write.barcode;
	existing.salePrice = write.salePrice;
	existing.supplyPrice = write.supplyPrice;
	existing.measurement = write.measurement;
	existing.type = write.type;
	existing.lowStockThreshold = write.lowStockThreshold ?? null;
	existing.isLowStock =
		existing.lowStockThreshold != null && existing.totalStock <= existing.lowStockThreshold;
	existing.packaging = write.packaging;
	existing.images = write.images;

	// Reflect a category move (only active products count).
	if (!existing.isArchived && previousCategoryId !== write.categoryId) {
		if (previousCategoryId != null) {
			adjustCategoryProductCount(previousCategoryId, -1);
		}
		if (write.categoryId != null) {
			adjustCategoryProductCount(write.categoryId, 1);
		}
	}

	return existing;
}

export function setProductArchived(id: number, archived: boolean): Product | undefined {
	const existing = findProduct(id);
	if (!existing || existing.isArchived === archived) {
		return existing;
	}

	existing.isArchived = archived;

	// productCount tracks active products: archiving removes it, restoring adds.
	if (existing.categoryId != null) {
		adjustCategoryProductCount(existing.categoryId, archived ? -1 : 1);
	}

	return existing;
}

/* ───────────────────── history: transactions + movements ──────────────────
 * Deterministic per-product ledgers derived from the seeded warehouse
 * holdings, so the list, the detail stock table, the transaction history and
 * the movements ledger all reconcile (seed-data rule 2):
 *  - per warehouse: opening + Σ(movement deltas) = current quantity, and the
 *    running balance never goes negative (rule 20);
 *  - supplies are priced at the warehouse WAC (so the served averageCost is
 *    exactly consistent with the purchase history); sales/refunds at salePrice;
 *  - `balanceAfter` is the served running total across all warehouses
 *    (hard rule 8) — the total opening stock is its remainder before the
 *    oldest movement.
 * Products created in-session start with an empty history.
 */

const HISTORY_PARTNERS = [
	{ id: 1, name: "Магазин «Хоразм»" },
	{ id: 2, name: "ИП Рахимов А." },
	{ id: 3, name: "Дилшод Савдо" },
	{ id: 4, name: "ООО «Бухоро Трейд»" },
	{ id: 5, name: "Магазин «Чорсу»" },
	{ id: 6, name: "Нодира Юсупова" },
];

type LedgerEvent = {
	kind: ProductMovement["kind"];
	warehouseId: number;
	/** Signed delta in base units. */
	quantity: number;
	unitPrice: number;
	daysAgo: number;
};

type ProductHistory = { transactions: ProductTransaction[]; movements: ProductMovement[] };

const MS_PER_DAY = 86_400_000;

function isoDaysAgo(daysAgo: number): string {
	return new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString();
}

/** Plan one warehouse's flows: opening + events land exactly on `final`. */
function planWarehouseFlows(
	product: Product,
	item: ProductWarehouseItem,
	warehouseIndex: number,
): { opening: number; events: LedgerEvent[] } {
	const final = item.quantity;
	const stagger = warehouseIndex * 3 + (product.id % 4);
	const events: LedgerEvent[] = [];

	if (final === 0 && item.averageCost > 0) {
		// Sold out: one supply fully consumed by two sales.
		const supplied = 40 + (product.id % 5) * 6;
		const firstSale = Math.round(supplied * 0.6);
		events.push(
			{
				kind: "Supply",
				warehouseId: item.warehouseId,
				quantity: supplied,
				unitPrice: item.averageCost,
				daysAgo: 41 - stagger,
			},
			{
				kind: "Sale",
				warehouseId: item.warehouseId,
				quantity: -firstSale,
				unitPrice: product.salePrice,
				daysAgo: 27 - stagger,
			},
			{
				kind: "Sale",
				warehouseId: item.warehouseId,
				quantity: -(supplied - firstSale),
				unitPrice: product.salePrice,
				daysAgo: 13 - stagger,
			},
		);
		return { opening: 0, events };
	}

	const opening = Math.round(final * 0.35);
	const net = final - opening;
	const refund = Math.round(final * 0.05);
	const sold = Math.round(final * 0.25);

	if (product.type === "Supply") {
		// Purchase-only consumable: stock arrives by supply alone.
		events.push({
			kind: "Supply",
			warehouseId: item.warehouseId,
			quantity: net,
			unitPrice: item.averageCost,
			daysAgo: 33 - stagger,
		});
		return { opening, events };
	}

	if (product.type === "Sale") {
		// Sale-only: carried in as opening stock, then sold down (+ a refund).
		const saleOut = sold > 0 ? sold : 1;
		events.push({
			kind: "Sale",
			warehouseId: item.warehouseId,
			quantity: -saleOut,
			unitPrice: product.salePrice,
			daysAgo: 24 - stagger,
		});
		if (refund > 0) {
			events.push({
				kind: "SaleRefund",
				warehouseId: item.warehouseId,
				quantity: refund,
				unitPrice: product.salePrice,
				daysAgo: 9 - stagger,
			});
		}
		return { opening: final + saleOut - refund, events };
	}

	// Both-type: supply in, sale out, then a small sale refund back in.
	const supplied = net + sold - refund;
	events.push({
		kind: "Supply",
		warehouseId: item.warehouseId,
		quantity: supplied,
		unitPrice: item.averageCost,
		daysAgo: 38 - stagger,
	});
	if (sold > 0) {
		events.push({
			kind: "Sale",
			warehouseId: item.warehouseId,
			quantity: -sold,
			unitPrice: product.salePrice,
			daysAgo: 22 - stagger,
		});
	}
	if (refund > 0) {
		events.push({
			kind: "SaleRefund",
			warehouseId: item.warehouseId,
			quantity: refund,
			unitPrice: product.salePrice,
			daysAgo: 8 - stagger,
		});
	}
	return { opening, events };
}

function buildHistory(product: Product): ProductHistory {
	const allEvents: LedgerEvent[] = [];
	let totalOpening = 0;

	product.warehouseItems.forEach((item, index) => {
		const { opening, events } = planWarehouseFlows(product, item, index);
		totalOpening += opening;
		allEvents.push(...events);
	});

	if (allEvents.length === 0) {
		return { transactions: [], movements: [] };
	}

	// Chronological (oldest first) to thread the served running balance.
	const chronological = [...allEvents].sort((a, b) => b.daysAgo - a.daysAgo);

	let balance = totalOpening;
	const movements: ProductMovement[] = chronological.map((event, index) => {
		balance += event.quantity;
		return {
			id: product.id * 1000 + index + 1,
			productId: product.id,
			date: isoDaysAgo(event.daysAgo),
			kind: event.kind,
			warehouseId: event.warehouseId,
			warehouseName: warehouseName(event.warehouseId),
			quantity: event.quantity,
			balanceAfter: balance,
		};
	});

	const transactions: ProductTransaction[] = chronological.map((event, index) => {
		const partner = HISTORY_PARTNERS[(product.id + index) % HISTORY_PARTNERS.length];
		return {
			id: product.id * 1000 + index + 1,
			productId: product.id,
			transactionType: event.kind,
			partnerId: partner.id,
			partnerName: partner.name,
			date: isoDaysAgo(event.daysAgo),
			quantity: event.quantity,
			unitPrice: event.unitPrice,
			discount: 0,
		};
	});

	// Served newest first.
	return { transactions: transactions.reverse(), movements: movements.reverse() };
}

const histories = new Map<number, ProductHistory>(
	products.map((product) => [product.id, buildHistory(product)]),
);

export function listProductTransactions(productId: number): ProductTransaction[] {
	return histories.get(productId)?.transactions ?? [];
}

export function listProductMovements(productId: number): ProductMovement[] {
	return histories.get(productId)?.movements ?? [];
}
