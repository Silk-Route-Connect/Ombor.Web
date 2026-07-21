import { Category } from "../../models/category";

/**
 * In-memory seed + mutation for the Categories mock. Mutations persist within a
 * session and reset on reload (docs/mocking.md).
 *
 * Cross-module reference consistency (seed-data rule 5): ids 1–20 and their
 * names are a snapshot of the REAL backend's categories, so real product flows
 * (the products endpoint is NOT mocked) keep resolving these ids. Each is
 * enriched with an illustrative `productCount` — the field the real CategoryDto
 * lacks, served by the data layer exactly as the backend will (hard rule 8).
 *
 * Categories are uniform (business-rules rule 42): no protected default row.
 */
const seed: Category[] = [
	{
		id: 1,
		name: "Электроника",
		description: "Бытовая и портативная электроника",
		productCount: 12,
	},
	{ id: 2, name: "Фильмы", description: "Фильмы на дисках и цифровые издания", productCount: 5 },
	{ id: 3, name: "Пряжа", description: "Пряжа и материалы для рукоделия", productCount: 3 },
	{ id: 4, name: "обувь", description: "Повседневная и сезонная обувь", productCount: 8 },
	{
		id: 5,
		name: "Автомобильное",
		description: "Товары и аксессуары для автомобилей",
		productCount: 6,
	},
	{ id: 6, name: "Одежда", description: "Повседневная и сезонная одежда", productCount: 14 },
	{ id: 7, name: "Игрушки", description: "Детские игрушки и игровые наборы", productCount: 4 },
	{ id: 8, name: "промышленное", description: "Промышленные товары и оснастка", productCount: 0 },
	{ id: 9, name: "музыка", description: "Музыкальные носители и инструменты", productCount: 7 },
	{ id: 10, name: "компьютеры", description: "Компьютеры и комплектующие", productCount: 9 },
	{ id: 11, name: "здоровье", description: "Товары для здоровья и ухода", productCount: 2 },
	{ id: 12, name: "игры", description: "Настольные и видеоигры", productCount: 5 },
	{ id: 13, name: "Дом", description: "Товары для дома и хозяйства", productCount: 11 },
	{ id: 14, name: "садинструмент", description: "Садовый инструмент и инвентарь", productCount: 0 },
	{ id: 15, name: "Галантерея", description: "Галантерея и аксессуары", productCount: 3 },
	{ id: 16, name: "красота", description: "Косметика и средства по уходу", productCount: 6 },
	{ id: 17, name: "Книги", description: "Книги и печатные издания", productCount: 10 },
	{ id: 18, name: "украшения", description: "Бижутерия и украшения", productCount: 4 },
	{ id: 19, name: "туризм", description: "Туристическое снаряжение", productCount: 0 },
	{ id: 20, name: "детское", description: "Товары для детей", productCount: 7 },
];

let categories: Category[] = seed.map((category) => ({ ...category }));
// Created categories get ids after the seeded real range.
let nextId = Math.max(...categories.map((category) => category.id)) + 1;

export function listCategories(): Category[] {
	return categories;
}

export function findCategory(id: number): Category | undefined {
	return categories.find((category) => category.id === id);
}

export function categoryNameExists(name: string, exceptId?: number): boolean {
	const normalized = name.trim().toLowerCase();

	return categories.some(
		(category) => category.id !== exceptId && category.name.trim().toLowerCase() === normalized,
	);
}

export function addCategory(name: string, description: string | null): Category {
	const created: Category = {
		id: nextId++,
		name,
		description,
		productCount: 0,
	};
	categories = [created, ...categories];

	return created;
}

export function editCategory(
	id: number,
	name: string,
	description: string | null,
): Category | undefined {
	const existing = findCategory(id);
	if (!existing) {
		return undefined;
	}

	existing.name = name;
	existing.description = description;

	return existing;
}

export function removeCategory(id: number): void {
	categories = categories.filter((category) => category.id !== id);
}

/**
 * Overwrite a category's `productCount`. Used by the Products mock to keep the
 * two resources consistent: `productCount` reflects the number of active
 * (non-archived) products referencing the category (seed-data rule 2).
 */
export function setCategoryProductCount(id: number, count: number): void {
	const existing = findCategory(id);
	if (existing) {
		existing.productCount = count;
	}
}

/** Shift a category's `productCount` by `delta`, clamped at zero. */
export function adjustCategoryProductCount(id: number, delta: number): void {
	const existing = findCategory(id);
	if (existing) {
		existing.productCount = Math.max(0, existing.productCount + delta);
	}
}
