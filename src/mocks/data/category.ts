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
 * The Default Category «Без категории» (id 0, isDefault) is a target-contract
 * addition the real backend has no row for — it backstops "Category required"
 * and cannot be deleted. NOTE: products cannot be created against id 0 on the
 * real backend (it has no such row); it is a display/safeguard concept only.
 */
const seed: Category[] = [
	{
		id: 0,
		name: "Без категории",
		description: "Системная категория по умолчанию для товаров без явной группы",
		productCount: 0,
		isDefault: true,
	},
	{
		id: 1,
		name: "Электроника",
		description: "Бытовая и портативная электроника",
		productCount: 12,
		isDefault: false,
	},
	{
		id: 2,
		name: "Фильмы",
		description: "Фильмы на дисках и цифровые издания",
		productCount: 5,
		isDefault: false,
	},
	{
		id: 3,
		name: "Пряжа",
		description: "Пряжа и материалы для рукоделия",
		productCount: 3,
		isDefault: false,
	},
	{
		id: 4,
		name: "обувь",
		description: "Повседневная и сезонная обувь",
		productCount: 8,
		isDefault: false,
	},
	{
		id: 5,
		name: "Автомобильное",
		description: "Товары и аксессуары для автомобилей",
		productCount: 6,
		isDefault: false,
	},
	{
		id: 6,
		name: "Одежда",
		description: "Повседневная и сезонная одежда",
		productCount: 14,
		isDefault: false,
	},
	{
		id: 7,
		name: "Игрушки",
		description: "Детские игрушки и игровые наборы",
		productCount: 4,
		isDefault: false,
	},
	{
		id: 8,
		name: "промышленное",
		description: "Промышленные товары и оснастка",
		productCount: 0,
		isDefault: false,
	},
	{
		id: 9,
		name: "музыка",
		description: "Музыкальные носители и инструменты",
		productCount: 7,
		isDefault: false,
	},
	{
		id: 10,
		name: "компьютеры",
		description: "Компьютеры и комплектующие",
		productCount: 9,
		isDefault: false,
	},
	{
		id: 11,
		name: "здоровье",
		description: "Товары для здоровья и ухода",
		productCount: 2,
		isDefault: false,
	},
	{
		id: 12,
		name: "игры",
		description: "Настольные и видеоигры",
		productCount: 5,
		isDefault: false,
	},
	{
		id: 13,
		name: "Дом",
		description: "Товары для дома и хозяйства",
		productCount: 11,
		isDefault: false,
	},
	{
		id: 14,
		name: "садинструмент",
		description: "Садовый инструмент и инвентарь",
		productCount: 0,
		isDefault: false,
	},
	{
		id: 15,
		name: "Галантерея",
		description: "Галантерея и аксессуары",
		productCount: 3,
		isDefault: false,
	},
	{
		id: 16,
		name: "красота",
		description: "Косметика и средства по уходу",
		productCount: 6,
		isDefault: false,
	},
	{
		id: 17,
		name: "Книги",
		description: "Книги и печатные издания",
		productCount: 10,
		isDefault: false,
	},
	{
		id: 18,
		name: "украшения",
		description: "Бижутерия и украшения",
		productCount: 4,
		isDefault: false,
	},
	{
		id: 19,
		name: "туризм",
		description: "Туристическое снаряжение",
		productCount: 0,
		isDefault: false,
	},
	{ id: 20, name: "детское", description: "Товары для детей", productCount: 7, isDefault: false },
];

let categories: Category[] = seed.map((category) => ({ ...category }));
// Created categories get ids after the real range (default id 0 is excluded).
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
		isDefault: false,
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
