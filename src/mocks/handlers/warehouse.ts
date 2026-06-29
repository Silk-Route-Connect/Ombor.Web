import { delay, http, HttpResponse } from "msw";

import { AddOpeningStockRequest, CreateWarehouseRequest } from "../../models/warehouse";
import {
	addOpeningStock,
	addWarehouse,
	editWarehouse,
	findWarehouse,
	listWarehouseMovements,
	listWarehouses,
	listWarehouseStock,
	removeWarehouse,
	setWarehouseArchived,
	warehouseNameExists,
	WarehouseWrite,
} from "../data/warehouse";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL
 * (a different origin than the dev server), so the `*` host wildcard matches
 * regardless of the configured API base. The redesigned warehouse resource is
 * mocked at `/api/warehouses` (the stale backend resource is `/api/inventories`
 * — see docs/mocking.md and mocks/data/warehouse.ts).
 */
const LIST_URL = "*/api/warehouses";
const ITEM_URL = "*/api/warehouses/:id";
const STOCK_URL = "*/api/warehouses/:id/stock";
const MOVEMENTS_URL = "*/api/warehouses/:id/movements";
const ARCHIVE_URL = "*/api/warehouses/:id/archive";
const RESTORE_URL = "*/api/warehouses/:id/restore";
const OPENING_STOCK_URL = "*/api/warehouses/:id/opening-stock";

const NAME_MIN = 2;
const NAME_MAX = 250;
const LOCATION_MAX = 250;

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

function parseWrite(body: Partial<CreateWarehouseRequest>): WarehouseWrite {
	const name = typeof body.name === "string" ? body.name.trim() : "";
	const location = typeof body.location === "string" ? body.location.trim() : "";
	return { name, location: location === "" ? null : location };
}

function validate(write: WarehouseWrite, exceptId?: number): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	if (write.name.length < NAME_MIN) {
		errors.name = ["Введите название склада (минимум 2 символа)"];
	} else if (write.name.length > NAME_MAX) {
		errors.name = [`Название не должно превышать ${NAME_MAX} символов`];
	} else if (warehouseNameExists(write.name, exceptId)) {
		errors.name = ["Склад с таким названием уже существует"];
	}

	if ((write.location?.length ?? 0) > LOCATION_MAX) {
		errors.location = [`Адрес не должен превышать ${LOCATION_MAX} символов`];
	}

	return errors;
}

export const warehouseHandlers = [
	// CONTRACT: GET /api/warehouses
	// query: none — full dataset, archived included (carry the isArchived flag;
	//        client-side search/filter). Served aggregates productCount /
	//        totalUnits / stockValue (hard rule 8); an archived warehouse that
	//        still holds stock still reports them (rule 31).
	// response 200: Warehouse[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listWarehouses());
	}),

	// CONTRACT: GET /api/warehouses/:id
	// response 200: Warehouse
	// errors: 404 ProblemDetails, 401
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const warehouse = findWarehouse(Number(params.id));
		if (!warehouse) {
			return problem(404, "Not Found", "Склад не найден");
		}

		return HttpResponse.json(warehouse);
	}),

	// CONTRACT: GET /api/warehouses/:id/stock
	// query: none — full per-warehouse stock, products on hand only (client-side
	//        search/filter/sort)
	// response 200: WarehouseStockItem[] (quantity, served WAC averageCost, value)
	// errors: 404 ProblemDetails, 401
	http.get(STOCK_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findWarehouse(id)) {
			return problem(404, "Not Found", "Склад не найден");
		}

		return HttpResponse.json(listWarehouseStock(id));
	}),

	// CONTRACT: GET /api/warehouses/:id/movements
	// query: none — full warehouse ledger, newest first (client-side list ops);
	//        `balanceAfter` is the served per-warehouse running balance per
	//        product (hard rule 8)
	// response 200: WarehouseMovement[]
	// errors: 404 ProblemDetails, 401
	http.get(MOVEMENTS_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findWarehouse(id)) {
			return problem(404, "Not Found", "Склад не найден");
		}

		return HttpResponse.json(listWarehouseMovements(id));
	}),

	// CONTRACT: POST /api/warehouses
	// body: CreateWarehouseRequest { name: string; location?: string | null }
	//   Created empty — stock arrives later via the opening-stock flow (rule 22).
	// response 201: Warehouse (zero aggregates)
	// errors: 400 ValidationProblemDetails (name / duplicate name), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const write = parseWrite((await request.json()) as Partial<CreateWarehouseRequest>);
		const errors = validate(write);

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addWarehouse(write), { status: 201 });
	}),

	// CONTRACT: PUT /api/warehouses/:id
	// body: UpdateWarehouseRequest { id; name; location? }
	// response 200: Warehouse
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.put(ITEM_URL, async ({ request, params }) => {
		await delay(350);

		const id = Number(params.id);
		if (!findWarehouse(id)) {
			return problem(404, "Not Found", "Склад не найден");
		}

		const write = parseWrite((await request.json()) as Partial<CreateWarehouseRequest>);
		const errors = validate(write, id);

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(editWarehouse(id, write));
	}),

	// CONTRACT: DELETE /api/warehouses/:id
	// Hard-delete, reference-gated (business-rules rule 32): allowed only for an
	// unreferenced warehouse (`isDeletable`). A warehouse with any stock or
	// movement history returns 409 — the client offers archiving instead.
	// response 204: no content
	// errors: 404 ProblemDetails, 409 ProblemDetails (referenced), 401
	http.delete(ITEM_URL, async ({ params }) => {
		await delay(300);

		const id = Number(params.id);
		const warehouse = findWarehouse(id);
		if (!warehouse) {
			return problem(404, "Not Found", "Склад не найден");
		}

		if (!warehouse.isDeletable) {
			return problem(
				409,
				"Conflict",
				"На склад ссылаются другие записи (остатки, движения, перемещения) — удаление невозможно. Архивируйте склад.",
			);
		}

		removeWarehouse(id);
		return new HttpResponse(null, { status: 204 });
	}),

	// CONTRACT: POST /api/warehouses/:id/archive
	// Soft-delete (rule 29); an archived warehouse with residual stock still
	// counts in totals (rule 31).
	// response 200: Warehouse (isArchived true)
	// errors: 404 ProblemDetails, 401
	http.post(ARCHIVE_URL, async ({ params }) => {
		await delay(250);

		const updated = setWarehouseArchived(Number(params.id), true);
		if (!updated) {
			return problem(404, "Not Found", "Склад не найден");
		}

		return HttpResponse.json(updated);
	}),

	// CONTRACT: POST /api/warehouses/:id/restore
	// response 200: Warehouse (isArchived false)
	// errors: 404 ProblemDetails, 401
	http.post(RESTORE_URL, async ({ params }) => {
		await delay(250);

		const updated = setWarehouseArchived(Number(params.id), false);
		if (!updated) {
			return problem(404, "Not Found", "Склад не найден");
		}

		return HttpResponse.json(updated);
	}),

	// CONTRACT: POST /api/warehouses/:id/opening-stock
	// body: AddOpeningStockRequest { items: { productId; quantity; unitCost }[]; note? }
	//   An audited stock-in event (rule 22); WAC updates per rule 18.
	// response 200: Warehouse (refreshed aggregates)
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.post(OPENING_STOCK_URL, async ({ request, params }) => {
		await delay(350);

		const id = Number(params.id);
		if (!findWarehouse(id)) {
			return problem(404, "Not Found", "Склад не найден");
		}

		const body = (await request.json()) as AddOpeningStockRequest;
		const items = Array.isArray(body.items) ? body.items : [];
		const errors: Record<string, string[]> = {};

		if (items.length === 0) {
			errors.items = ["Добавьте хотя бы одну позицию"];
		} else {
			items.forEach((line, index) => {
				if (!line.productId) {
					errors[`items[${index}].productId`] = ["Выберите товар"];
				}
				if (!(line.quantity > 0)) {
					errors[`items[${index}].quantity`] = ["Количество должно быть больше нуля"];
				}
				// Unit cost may be 0 (free / sample stock, per canon); only a negative is invalid.
				if (line.unitCost < 0) {
					errors[`items[${index}].unitCost`] = ["Не может быть отрицательным"];
				}
			});
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addOpeningStock(id, items, body.note ?? null));
	}),
];
