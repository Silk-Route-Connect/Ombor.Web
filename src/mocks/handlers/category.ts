import { delay, http, HttpResponse } from "msw";

import { Category, CreateCategoryRequest, UpdateCategoryRequest } from "../../models/category";
import {
	addCategory,
	categoryNameExists,
	editCategory,
	findCategory,
	listCategories,
	removeCategory,
} from "../data/category";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL
 * (a different origin than the dev server), so the `*` host wildcard matches
 * regardless of the configured API base.
 */
const LIST_URL = "*/api/categories";
const ITEM_URL = "*/api/categories/:id";

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

/** ASP.NET ProblemDetails (matches the backend's error shape — see openapi.json). */
function problem(status: number, title: string, detail?: string) {
	return HttpResponse.json({ status, title, detail }, { status });
}

/** ValidationProblemDetails: field-keyed `errors` map. */
function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

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

/** ru plural for «товар» — keeps the 409 detail well-formed. */
function plural(n: number): string {
	const a = n % 10;
	const b = n % 100;
	if (a === 1 && b !== 11) return "товар";
	if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return "товара";
	return "товаров";
}

export const categoryHandlers = [
	// CONTRACT: GET /api/categories
	// query: none — full dataset (client-side search/sort/pagination)
	// response 200: Category[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(250);

		return HttpResponse.json(listCategories());
	}),

	// CONTRACT: GET /api/categories/:id
	// response 200: Category
	// errors: 404 ProblemDetails, 401
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const category = findCategory(Number(params.id));
		if (!category) {
			return problem(404, "Not Found", "Категория не найдена");
		}

		return HttpResponse.json(category);
	}),

	// CONTRACT: POST /api/categories
	// body: CreateCategoryRequest { name: string; description?: string | null }
	// response 201: Category (productCount 0, isDefault false)
	// errors: 400 ValidationProblemDetails (validation / duplicate name), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(300);

		const body = (await request.json()) as CreateCategoryRequest;
		const errors = validate(body);

		if (!errors.name && categoryNameExists(body.name)) {
			errors.name = ["Категория с таким названием уже существует"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		const created = addCategory(body.name.trim(), body.description?.trim() || null);

		return HttpResponse.json(created, { status: 201 });
	}),

	// CONTRACT: PUT /api/categories/:id
	// body: UpdateCategoryRequest { id: number; name: string; description?: string | null }
	// response 200: Category
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.put(ITEM_URL, async ({ request, params }) => {
		await delay(300);

		const id = Number(params.id);
		if (!findCategory(id)) {
			return problem(404, "Not Found", "Категория не найдена");
		}

		const body = (await request.json()) as UpdateCategoryRequest;
		const errors = validate(body);

		if (!errors.name && categoryNameExists(body.name, id)) {
			errors.name = ["Категория с таким названием уже существует"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
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
	// errors: 404 ProblemDetails (missing),
	//         409 ProblemDetails when the category is the Default Category or still
	//             has referencing products (no hard-delete with history — rule 32),
	//         401
	http.delete(ITEM_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		const existing = findCategory(id);
		if (!existing) {
			return problem(404, "Not Found", "Категория не найдена");
		}

		if (existing.isDefault) {
			return problem(409, "Conflict", "Категорию по умолчанию нельзя удалить");
		}

		if (existing.productCount > 0) {
			return problem(
				409,
				"Conflict",
				`Невозможно удалить: категория содержит ${existing.productCount} ${plural(existing.productCount)}`,
			);
		}

		removeCategory(id);

		return new HttpResponse(null, { status: 204 });
	}),
];
