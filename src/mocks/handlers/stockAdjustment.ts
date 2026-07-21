import { delay, http, HttpResponse } from "msw";

import {
	ADJUSTMENT_DIRECTIONS,
	CreateStockAdjustmentRequest,
	DECREASE_REASONS,
	INCREASE_REASONS,
} from "../../models/stockAdjustment";
import {
	addStockAdjustment,
	availableStock,
	listStockAdjustments,
	StockAdjustmentWrite,
} from "../data/stockAdjustment";

/**
 * Origin-agnostic matchers (the axios client targets VITE_OMBOR_API_BASE_URL).
 * The resource is mocked at `/api/stock-adjustments` (no backend endpoint exists
 * — docs/mocking.md). Adjustments are immutable: list + create only.
 */
const LIST_URL = "*/api/stock-adjustments";

function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

function validate(body: Partial<CreateStockAdjustmentRequest>): {
	errors: Record<string, string[]>;
	write?: StockAdjustmentWrite;
} {
	const errors: Record<string, string[]> = {};

	const warehouseId = Number(body.warehouseId);
	const productId = Number(body.productId);
	const quantity = Number(body.quantity);
	const direction = body.direction;
	const reason = body.reason;

	if (!warehouseId) {
		errors.warehouseId = ["Выберите склад"];
	}
	if (!productId) {
		errors.productId = ["Выберите товар"];
	}
	if (!direction || !ADJUSTMENT_DIRECTIONS.includes(direction)) {
		errors.direction = ["Укажите направление"];
	}
	if (!(quantity > 0)) {
		errors.quantity = ["Количество должно быть больше нуля"];
	}

	const validReasons: readonly string[] =
		direction === "Increase" ? INCREASE_REASONS : DECREASE_REASONS;
	if (!reason || !validReasons.includes(reason)) {
		errors.reason = ["Выберите причину"];
	}

	// Hard-block negative stock (rule 20): a Decrease cannot exceed availability.
	if (
		!errors.quantity &&
		direction === "Decrease" &&
		warehouseId &&
		productId &&
		quantity > availableStock(productId, warehouseId)
	) {
		const avail = availableStock(productId, warehouseId);
		errors.quantity = [`Недостаточно товара: доступно ${avail}, запрошено ${quantity}`];
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		errors,
		write: {
			warehouseId,
			productId,
			direction: direction!,
			quantity,
			reason: reason!,
			note: typeof body.note === "string" && body.note.trim() !== "" ? body.note.trim() : null,
		},
	};
}

export const stockAdjustmentHandlers = [
	// CONTRACT: GET /api/stock-adjustments
	// query: none — full immutable history, newest first (client-side list ops)
	// response 200: StockAdjustment[] (served warehouse/product fields +
	//               balanceAfter per hard rule 8)
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listStockAdjustments());
	}),

	// CONTRACT: POST /api/stock-adjustments
	// body: CreateStockAdjustmentRequest { warehouseId; productId; direction;
	//       quantity; reason; note? }
	// response 201: StockAdjustment
	// errors: 400 ValidationProblemDetails (required fields; a Decrease over
	//         availability is hard-blocked — rule 20), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreateStockAdjustmentRequest>;
		const { errors, write } = validate(body);

		if (!write) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addStockAdjustment(write), { status: 201 });
	}),
];
