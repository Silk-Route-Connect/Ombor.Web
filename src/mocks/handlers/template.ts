import { delay, http, HttpResponse } from "msw";

import { CreateTemplateRequest, TemplateType, UpdateTemplateRequest } from "../../models/template";
import {
	addTemplate,
	deleteTemplate,
	findTemplate,
	listTemplates,
	updateTemplate,
} from "../data/template";

/**
 * Origin-agnostic matchers (the axios client targets VITE_OMBOR_API_BASE_URL).
 * Templates are mocked at `/api/templates` because the live `TemplateDto` is
 * stale relative to the redesign (no last-used date, no per-item SKU / unit) —
 * docs/mocking.md. Templates are editable & deletable baskets: full CRUD.
 */
const LIST_URL = "*/api/templates";
const ITEM_URL = "*/api/templates/:id";

function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

/** Shared validation for create/update — name, partner, type, and ≥1 valid line. */
function validate(body: Partial<CreateTemplateRequest>): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	if (!body.name || !body.name.trim()) {
		errors.name = ["Введите название шаблона"];
	}
	if (!Number(body.partnerId)) {
		errors.partnerId = ["Выберите партнёра"];
	}
	if (body.type !== "Sale" && body.type !== "Supply") {
		errors.type = ["Неверный тип шаблона"];
	}

	const rawItems = Array.isArray(body.items) ? body.items : [];
	if (rawItems.length === 0) {
		errors.items = ["Добавьте хотя бы одну позицию"];
	} else {
		rawItems.forEach((item, index) => {
			if (!Number(item?.productId)) {
				errors[`items[${index}].productId`] = ["Выберите товар"];
			}
			if (!(Number(item?.quantity) > 0)) {
				errors[`items[${index}].quantity`] = ["Количество должно быть больше нуля"];
			}
			if (!(Number(item?.unitPrice) > 0)) {
				errors[`items[${index}].unitPrice`] = ["Цена должна быть больше нуля"];
			}
		});
	}

	return errors;
}

export const templateHandlers = [
	// CONTRACT: GET /api/templates?searchTerm&type
	// query: searchTerm? (name or partner), type? (Sale | Supply)
	// response 200: Template[] (served partnerName, lastUsedAt, per-item sku/unit)
	// errors: 401
	http.get(LIST_URL, async ({ request }) => {
		await delay(300);

		const url = new URL(request.url);
		const searchTerm = url.searchParams.get("searchTerm");
		const rawType = url.searchParams.get("type");
		const type = rawType === "Sale" || rawType === "Supply" ? (rawType as TemplateType) : null;

		return HttpResponse.json(listTemplates(searchTerm, type));
	}),

	// CONTRACT: GET /api/templates/{id}
	// response 200: Template · 404 when absent
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const template = findTemplate(Number(params.id));
		if (!template) {
			return HttpResponse.json({ status: 404, title: "Template not found." }, { status: 404 });
		}

		return HttpResponse.json(template);
	}),

	// CONTRACT: POST /api/templates
	// body: CreateTemplateRequest { name; partnerId; type; items: { productId;
	//       quantity; unitPrice; discount? }[] }
	// response 201: Template · 400 ValidationProblemDetails (required fields; ≥1 line)
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreateTemplateRequest>;
		const errors = validate(body);
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addTemplate(body as CreateTemplateRequest), { status: 201 });
	}),

	// CONTRACT: PUT /api/templates/{id}
	// body: UpdateTemplateRequest (same shape as create)
	// response 200: Template · 400 ValidationProblemDetails · 404 when absent
	http.put(ITEM_URL, async ({ params, request }) => {
		await delay(350);

		const id = Number(params.id);
		const body = (await request.json()) as Partial<UpdateTemplateRequest>;
		const errors = validate(body);
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		const updated = updateTemplate(id, body as UpdateTemplateRequest);
		if (!updated) {
			return HttpResponse.json({ status: 404, title: "Template not found." }, { status: 404 });
		}

		return HttpResponse.json(updated);
	}),

	// CONTRACT: DELETE /api/templates/{id}
	// response 200 · 404 when absent. A template touches no money or stock, so
	// deletion is unconditional (no reference gate).
	http.delete(ITEM_URL, async ({ params }) => {
		await delay(300);

		const removed = deleteTemplate(Number(params.id));
		if (!removed) {
			return HttpResponse.json({ status: 404, title: "Template not found." }, { status: 404 });
		}

		return new HttpResponse(null, { status: 200 });
	}),
];
