import {
	Measurement,
	Product,
	ProductImage,
	ProductInventoryItem,
	ProductPackaging,
	ProductType,
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
 * `inventoryItems`, never on the client. Per-warehouse `averageCost` stays on
 * the inventory items (the detail page consumes it); the product-level WAC
 * aggregate was dropped from the list contract (decision 2026-06-12).
 */

/** The two seeded warehouses (mirrors the design's Inventories). */
const WAREHOUSES: Record<number, string> = {
	1: "Центральный склад",
	2: "Склад Чиланзар",
};

type StockSpec = { inventoryId: number; quantity: number; averageCost: number };

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
			{ inventoryId: 1, quantity: 60, averageCost: 96000 },
			{ inventoryId: 2, quantity: 25, averageCost: 97500 },
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
		stock: [{ inventoryId: 1, quantity: 40, averageCost: 79000 }],
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
			{ inventoryId: 1, quantity: 200, averageCost: 18200 },
			{ inventoryId: 2, quantity: 140, averageCost: 18500 },
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
		stock: [{ inventoryId: 1, quantity: 18, averageCost: 131000 }],
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
			{ inventoryId: 1, quantity: 30, averageCost: 425000 },
			{ inventoryId: 2, quantity: 12, averageCost: 430000 },
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
		stock: [{ inventoryId: 1, quantity: 75, averageCost: 56000 }],
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
			{ inventoryId: 1, quantity: 120, averageCost: 38500 },
			{ inventoryId: 2, quantity: 80, averageCost: 39000 },
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
		stock: [{ inventoryId: 1, quantity: 45, averageCost: 147000 }],
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
		stock: [{ inventoryId: 1, quantity: 22, averageCost: 322000 }],
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
			{ inventoryId: 1, quantity: 38, averageCost: 283000 },
			{ inventoryId: 2, quantity: 17, averageCost: 286000 },
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
		stock: [{ inventoryId: 1, quantity: 12, averageCost: 415000 }],
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
		stock: [{ inventoryId: 1, quantity: 60, averageCost: 86000 }],
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
		stock: [{ inventoryId: 1, quantity: 40, averageCost: 72000 }],
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
		// active but out of stock
		stock: [],
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
		stock: [{ inventoryId: 1, quantity: 55, averageCost: 52000 }],
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
			{ inventoryId: 1, quantity: 80, averageCost: 66000 },
			{ inventoryId: 2, quantity: 40, averageCost: 67000 },
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
		stock: [{ inventoryId: 1, quantity: 35, averageCost: 49000 }],
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
			{ inventoryId: 1, quantity: 90, averageCost: 111000 },
			{ inventoryId: 2, quantity: 60, averageCost: 112000 },
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
		stock: [{ inventoryId: 1, quantity: 300, averageCost: 12200 }],
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
		stock: [{ inventoryId: 1, quantity: 50, averageCost: 73000 }],
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
			{ inventoryId: 1, quantity: 28, averageCost: 96000 },
			{ inventoryId: 2, quantity: 15, averageCost: 97000 },
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
		stock: [{ inventoryId: 1, quantity: 64, averageCost: 48500 }],
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
		stock: [{ inventoryId: 1, quantity: 140, averageCost: 22500 }],
	},
	{
		id: 25,
		categoryId: 16,
		name: "Шампунь восстанавливающий, 400 мл",
		sku: "SKU-10025",
		salePrice: 54000,
		supplyPrice: 31000,
		retailPrice: 59000,
		measurement: "Liter",
		type: "All",
		lowStockThreshold: 120,
		imageColors: ["#7A5230", "#A06A38"],
		stock: [{ inventoryId: 1, quantity: 95, averageCost: 31500 }],
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
		stock: [{ inventoryId: 1, quantity: 70, averageCost: 45500 }],
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
		stock: [{ inventoryId: 1, quantity: 42, averageCost: 38500 }],
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
		stock: [{ inventoryId: 1, quantity: 80, averageCost: 15200 }],
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
		stock: [{ inventoryId: 1, quantity: 30, averageCost: 25500 }],
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

function inventoryName(inventoryId: number): string {
	return WAREHOUSES[inventoryId] ?? `Склад #${inventoryId}`;
}

function toInventoryItems(stock: StockSpec[]): ProductInventoryItem[] {
	return stock.map((s) => ({
		inventoryId: s.inventoryId,
		inventoryName: inventoryName(s.inventoryId),
		quantity: s.quantity,
		averageCost: s.averageCost,
	}));
}

/** Served aggregate: total quantity across warehouses (hard rule 8). */
function totalStockOf(items: ProductInventoryItem[]): number {
	return items.reduce((sum, i) => sum + i.quantity, 0);
}

function buildProduct(spec: ProductSeed): Product {
	const items = toInventoryItems(spec.stock ?? []);
	const totalStock = totalStockOf(items);
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
		inventoryItems: items,
		totalStock,
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
	retailPrice: number;
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
		retailPrice: write.retailPrice,
		measurement: write.measurement,
		type: write.type,
		lowStockThreshold: write.lowStockThreshold ?? null,
		isLowStock: false,
		isArchived: false,
		packaging: write.packaging,
		images: write.images,
		inventoryItems: [],
		totalStock: 0,
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
	existing.retailPrice = write.retailPrice;
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
