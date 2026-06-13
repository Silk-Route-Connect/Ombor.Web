import { delay, http, HttpResponse } from "msw";

import { Measurement, ProductImage, ProductPackaging, ProductType } from "../../models/product";
import {
	addProduct,
	editProduct,
	findProduct,
	listProductMovements,
	listProducts,
	listProductTransactions,
	ProductWrite,
	setProductArchived,
	skuExists,
} from "../data/product";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL
 * (a different origin than the dev server), so the `*` host wildcard matches
 * regardless of the configured API base.
 */
const LIST_URL = "*/api/products";
const ITEM_URL = "*/api/products/:id";
const ARCHIVE_URL = "*/api/products/:id/archive";
const RESTORE_URL = "*/api/products/:id/restore";
const TRANSACTIONS_URL = "*/api/products/:id/transactions";
const MOVEMENTS_URL = "*/api/products/:id/movements";

const NAME_MIN = 2;
const NAME_MAX = 250;
const SKU_MAX = 100;

const MEASUREMENTS: Measurement[] = ["Unit", "Gram", "Kilogram", "Liter", "None"];
const TYPES: ProductType[] = ["All", "Sale", "Supply"];

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

function num(value: FormDataEntryValue | null): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function str(value: FormDataEntryValue | null): string | undefined {
	if (typeof value !== "string") {
		return undefined;
	}
	const trimmed = value.trim();
	return trimmed === "" ? undefined : trimmed;
}

function parsePackaging(form: FormData): ProductPackaging | undefined {
	const size = form.get("packaging.size");
	if (size == null) {
		return undefined;
	}
	return {
		size: num(size),
		label: str(form.get("packaging.label")) ?? null,
		barcode: str(form.get("packaging.barcode")) ?? null,
	};
}

/** Build in-memory image records from uploaded files (object URLs for the session). */
function buildImages(form: FormData): ProductImage[] {
	const files = form.getAll("attachments").filter((f): f is File => f instanceof File);
	return files.map((file, index) => {
		const url = URL.createObjectURL(file);
		return {
			id: Date.now() + index,
			name: file.name,
			originalUrl: url,
			thumbnailUrl: url,
		};
	});
}

function parseWrite(form: FormData): ProductWrite {
	const categoryRaw = form.get("categoryId");
	const lowStockRaw = form.get("lowStockThreshold");
	const measurement = str(form.get("measurement")) as Measurement | undefined;
	const type = str(form.get("type")) as ProductType | undefined;

	return {
		categoryId: categoryRaw == null || categoryRaw === "" ? null : num(categoryRaw),
		name: str(form.get("name")) ?? "",
		sku: str(form.get("sku")) ?? "",
		description: str(form.get("description")),
		barcode: str(form.get("barcode")),
		salePrice: num(form.get("salePrice")),
		supplyPrice: num(form.get("supplyPrice")),
		retailPrice: num(form.get("retailPrice")),
		measurement: measurement && MEASUREMENTS.includes(measurement) ? measurement : "Unit",
		type: type && TYPES.includes(type) ? type : "All",
		lowStockThreshold: lowStockRaw == null || lowStockRaw === "" ? null : num(lowStockRaw),
		packaging: parsePackaging(form),
		images: buildImages(form),
	};
}

function validate(write: ProductWrite, exceptId?: number): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	if (write.name.length < NAME_MIN) {
		errors.name = ["Введите название товара (минимум 2 символа)"];
	} else if (write.name.length > NAME_MAX) {
		errors.name = [`Название не должно превышать ${NAME_MAX} символов`];
	}

	if (!write.sku) {
		errors.sku = ["Укажите артикул (SKU)"];
	} else if (write.sku.length > SKU_MAX) {
		errors.sku = [`Артикул не должен превышать ${SKU_MAX} символов`];
	} else if (skuExists(write.sku, exceptId)) {
		errors.sku = ["Товар с таким артикулом уже существует"];
	}

	return errors;
}

export const productHandlers = [
	// CONTRACT: GET /api/products
	// query: none — full dataset, archived included (carry the isArchived flag;
	//        client-side search/filter/sort/pagination)
	// response 200: Product[] (totalStock, value-weighted averageCost and
	//               per-warehouse inventoryItems all served per hard rule 8;
	//               the averageCost aggregate is surfaced on detail only)
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listProducts());
	}),

	// CONTRACT: GET /api/products/:id
	// response 200: Product
	// errors: 404 ProblemDetails, 401
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const product = findProduct(Number(params.id));
		if (!product) {
			return problem(404, "Not Found", "Товар не найден");
		}

		return HttpResponse.json(product);
	}),

	// CONTRACT: GET /api/products/:id/transactions
	// query: none — full per-product history, newest first (client-side list ops)
	// response 200: ProductTransaction[] (signed quantity: positive into stock)
	// errors: 404 ProblemDetails, 401
	http.get(TRANSACTIONS_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findProduct(id)) {
			return problem(404, "Not Found", "Товар не найден");
		}

		return HttpResponse.json(listProductTransactions(id));
	}),

	// CONTRACT: GET /api/products/:id/movements
	// query: none — full warehouse ledger, newest first (client-side list ops)
	// response 200: ProductMovement[] — `balanceAfter` is the served running
	//               total across warehouses (hard rule 8); the opening stock is
	//               the remainder before the oldest movement
	// errors: 404 ProblemDetails, 401
	http.get(MOVEMENTS_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findProduct(id)) {
			return problem(404, "Not Found", "Товар не найден");
		}

		return HttpResponse.json(listProductMovements(id));
	}),

	// CONTRACT: POST /api/products
	// body: multipart/form-data — CreateProductRequest fields + `attachments` files.
	//   No initial-quantity block: a product is created at zero stock and stocked
	//   later via an opening-stock event (canon rule 22).
	// response 201: Product (empty inventoryItems, totalStock 0, averageCost null)
	// errors: 400 ValidationProblemDetails (name / sku / duplicate sku), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const form = await request.formData();
		const write = parseWrite(form);
		const errors = validate(write);

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addProduct(write), { status: 201 });
	}),

	// CONTRACT: PUT /api/products/:id
	// body: multipart/form-data — UpdateProductRequest fields + `attachments` files
	// response 200: Product
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.put(ITEM_URL, async ({ request, params }) => {
		await delay(350);

		const id = Number(params.id);
		if (!findProduct(id)) {
			return problem(404, "Not Found", "Товар не найден");
		}

		const form = await request.formData();
		const write = parseWrite(form);
		const errors = validate(write, id);

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(editProduct(id, write));
	}),

	// CONTRACT: POST /api/products/:id/archive
	// Pure archive (no hard delete on referenced products — canon rules 17/22/32).
	// response 200: Product (isArchived true)
	// errors: 404 ProblemDetails, 401
	http.post(ARCHIVE_URL, async ({ params }) => {
		await delay(250);

		const updated = setProductArchived(Number(params.id), true);
		if (!updated) {
			return problem(404, "Not Found", "Товар не найден");
		}

		return HttpResponse.json(updated);
	}),

	// CONTRACT: POST /api/products/:id/restore
	// response 200: Product (isArchived false)
	// errors: 404 ProblemDetails, 401
	http.post(RESTORE_URL, async ({ params }) => {
		await delay(250);

		const updated = setProductArchived(Number(params.id), false);
		if (!updated) {
			return problem(404, "Not Found", "Товар не найден");
		}

		return HttpResponse.json(updated);
	}),
];
