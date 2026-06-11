import { Category } from "../../models/category";

/**
 * In-memory seed + mutation for the Categories mock. Mutations persist within a
 * session and reset on reload (docs/mocking.md). `productCount` is served by the
 * data layer exactly as the real backend will compute it from referencing
 * products — never recomputed in the UI (CLAUDE.md hard rule 8).
 *
 * The Default Category is system-created and cannot be deleted — it backstops
 * the "Category required" rule so every product always has one
 * (business-rules.md, Product domain model).
 */
const seed: Category[] = [
	{
		id: 1,
		name: "Без категории",
		description: "Системная категория по умолчанию для товаров без явной группы",
		productCount: 4,
		isDefault: true,
	},
	{
		id: 2,
		name: "Продукты",
		description: "Бакалея, крупы, масло, сахар и продукты длительного хранения",
		productCount: 6,
		isDefault: false,
	},
	{
		id: 3,
		name: "Напитки",
		description: "Чай, вода, соки, газированные напитки",
		productCount: 5,
		isDefault: false,
	},
	{
		id: 4,
		name: "Бытовая химия",
		description: "Чистящие и моющие средства, хозтовары",
		productCount: 3,
		isDefault: false,
	},
	{
		id: 5,
		name: "Одежда",
		description: "Повседневная и сезонная одежда",
		productCount: 2,
		isDefault: false,
	},
	{
		id: 6,
		name: "Аксессуары",
		description: null,
		productCount: 0,
		isDefault: false,
	},
];

let categories: Category[] = seed.map((category) => ({ ...category }));
let nextId = Math.max(...categories.map((category) => category.id)) + 1;

/** Naive substring match. The real backend implements Cyrillic↔Latin parity. */
export function searchCategories(search: string | null): Category[] {
	if (!search) {
		return categories;
	}

	const query = search.trim().toLowerCase();

	return categories.filter(
		(category) =>
			category.name.toLowerCase().includes(query) ||
			(category.description?.toLowerCase().includes(query) ?? false),
	);
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
