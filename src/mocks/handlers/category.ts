import { delay, http, HttpResponse } from "msw";

import {
	Category,
	CreateCategoryRequest,
	GetCategoriesResponse,
	UpdateCategoryRequest,
} from "../../models/category";
import {
	addCategory,
	categoryNameExists,
	editCategory,
	findCategory,
	removeCategory,
	searchCategories,
} from "../data/category";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL
 * (a different origin than the dev server), so the `*` host wildcard is used so
 * the handlers match regardless of the configured API base.
 */
const LIST_URL = "*/api/categories";
const ITEM_URL = "*/api/categories/:id";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

function validate(body: Partial<CreateCategoryRequest>): Record<string, string[]> {
	const errors: Record<string, string[]> = {};
	const name = body.name?.trim() ?? "";

	if (!name) {
		errors.name = ["Название категории обязательно"];
	} else if (name.length > NAME_MAX) {
		errors.name = [`Название не должно превышать ${NAME_MAX} символов`];
	}

	if ((body.description?.length ?? 0) > DESCRIPTION_MAX) {
		errors.description = [`Описание не должно превышать ${DESCRIPTION_MAX} символов`];
	}

	return errors;
}

export const categoryHandlers = [
	// CONTRACT: GET /api/categories
	// query: ?page=number (1-based, default 1) &pageSize=number (default 10)
	//        &search=string (matches name/description; backend is Cyrillic↔Latin tolerant)
	// response 200: PagedResponse<Category>
	// errors: 401
	http.get(LIST_URL, async ({ request }) => {
		await delay(250);

		const url = new URL(request.url);
		const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
		const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? "10") || 10);
		const search = url.searchParams.get("search");

		const matched = searchCategories(search);
		const start = (page - 1) * pageSize;
		const items = matched.slice(start, start + pageSize);

		const body: GetCategoriesResponse = {
			items,
			total: matched.length,
			page,
			pageSize,
		};

		return HttpResponse.json(body);
	}),

	// CONTRACT: POST /api/categories
	// body: CreateCategoryRequest { name: string; description?: string | null }
	// response 201: Category
	// errors: 400 { errors: Record<field, string[]> } (validation / duplicate name), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(300);

		const body = (await request.json()) as CreateCategoryRequest;
		const errors = validate(body);

		if (!errors.name && categoryNameExists(body.name)) {
			errors.name = ["Категория с таким названием уже существует"];
		}

		if (Object.keys(errors).length > 0) {
			return HttpResponse.json({ errors }, { status: 400 });
		}

		const created = addCategory(body.name.trim(), body.description?.trim() || null);

		return HttpResponse.json(created, { status: 201 });
	}),

	// CONTRACT: PUT /api/categories/:id
	// body: UpdateCategoryRequest { id: number; name: string; description?: string | null }
	// response 200: Category
	// errors: 400 { errors: Record<field, string[]> }, 404, 401
	http.put(ITEM_URL, async ({ request, params }) => {
		await delay(300);

		const id = Number(params.id);
		const existing = findCategory(id);
		if (!existing) {
			return HttpResponse.json({ error: "Категория не найдена" }, { status: 404 });
		}

		const body = (await request.json()) as UpdateCategoryRequest;
		const errors = validate(body);

		if (!errors.name && categoryNameExists(body.name, id)) {
			errors.name = ["Категория с таким названием уже существует"];
		}

		if (Object.keys(errors).length > 0) {
			return HttpResponse.json({ errors }, { status: 400 });
		}

		const updated = editCategory(
			id,
			body.name.trim(),
			body.description?.trim() || null,
		) as Category;

		return HttpResponse.json(updated);
	}),

	// CONTRACT: DELETE /api/categories/:id
	// response 204: no content
	// errors: 404 (missing),
	//         409 { error: string } when the category is the Default Category or
	//             still has referencing products (no hard-delete with history — rule 32).
	//         401
	http.delete(ITEM_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		const existing = findCategory(id);
		if (!existing) {
			return HttpResponse.json({ error: "Категория не найдена" }, { status: 404 });
		}

		if (existing.isDefault) {
			return HttpResponse.json({ error: "Категорию по умолчанию нельзя удалить" }, { status: 409 });
		}

		if (existing.productCount > 0) {
			return HttpResponse.json(
				{ error: `Невозможно удалить: категория содержит ${existing.productCount} товаров` },
				{ status: 409 },
			);
		}

		removeCategory(id);

		return new HttpResponse(null, { status: 204 });
	}),
];
