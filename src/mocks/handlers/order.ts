import { delay, http, HttpResponse } from "msw";

import { CreateOrderRequest, OrderStatus, UpdateOrderRequest } from "../../models/order";
import {
	cancelOrder,
	createOrder,
	deliverOrder,
	findOrder,
	listOrders,
	processOrder,
	rejectOrder,
	returnOrder,
	shipOrder,
	updateOrder,
} from "../data/order";

/**
 * Origin-agnostic matchers. Orders are mocked at `/api/orders` because the live
 * `OrderDto` lacks the status history, write-off warehouse, promoted-sale link,
 * and per-line SKU/unit the redesign needs (docs/mocking.md). The transition
 * endpoints return the updated Order (target contract) so the client refreshes
 * in one round-trip. `deliver` carries the chosen warehouse and hard-blocks on
 * insufficient stock (rule 20); promotion is self-contained (no Sale written, no
 * stock mutated).
 */
const LIST_URL = "*/api/orders";
const ITEM_URL = "*/api/orders/:id";
const PROCESS_URL = "*/api/orders/:id/process";
const SHIP_URL = "*/api/orders/:id/ship";
const DELIVER_URL = "*/api/orders/:id/deliver";
const CANCEL_URL = "*/api/orders/:id/cancel";
const REJECT_URL = "*/api/orders/:id/reject";
const RETURN_URL = "*/api/orders/:id/return";

function validationProblem(errors: Record<string, string[]>, status = 400) {
	return HttpResponse.json(
		{ status, title: "One or more validation errors occurred.", errors },
		{ status },
	);
}

const notFound = () => new HttpResponse(null, { status: 404 });

export const orderHandlers = [
	// CONTRACT: GET /api/orders?searchTerm&status → Order[] (newest first; client filters too)
	http.get(LIST_URL, async ({ request }) => {
		await delay(300);
		const url = new URL(request.url);
		const searchTerm = url.searchParams.get("searchTerm");
		const rawStatus = url.searchParams.get("status");
		return HttpResponse.json(listOrders(searchTerm, rawStatus as OrderStatus | null));
	}),

	// CONTRACT: POST /api/orders (CreateOrderRequest) → Order (new Pending order)
	//   400 ValidationProblemDetails when customer, warehouse or lines are missing.
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);
		const body = (await request.json().catch(() => ({}))) as Partial<CreateOrderRequest>;
		const errors: Record<string, string[]> = {};
		if (!Number(body.customerId)) {
			errors.customerId = ["Выберите клиента"];
		}
		if (!Number(body.warehouseId)) {
			errors.warehouseId = ["Выберите склад"];
		}
		if (!Array.isArray(body.lines) || body.lines.length === 0) {
			errors.lines = ["Добавьте хотя бы одну позицию"];
		}
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}
		return HttpResponse.json(createOrder(body as CreateOrderRequest), { status: 201 });
	}),

	// CONTRACT: POST /api/orders/{id}/process → Order (Pending → Processing)
	http.post(PROCESS_URL, async ({ params }) => {
		await delay(300);
		const updated = processOrder(Number(params.id));
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: POST /api/orders/{id}/ship → Order (Processing → Shipping)
	http.post(SHIP_URL, async ({ params }) => {
		await delay(300);
		const updated = shipOrder(Number(params.id));
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: POST /api/orders/{id}/deliver { warehouseId } → Order
	//   Shipping → Delivered + promotes to a Sale against the chosen warehouse.
	//   400 ValidationProblemDetails when a line exceeds stock (rule 20).
	http.post(DELIVER_URL, async ({ params, request }) => {
		await delay(350);
		const body = (await request.json().catch(() => ({}))) as { warehouseId?: number };
		const result = deliverOrder({ id: Number(params.id), warehouseId: Number(body.warehouseId) });
		if (!result.ok) {
			return result.status === 404 ? notFound() : validationProblem(result.errors, result.status);
		}
		return HttpResponse.json(result.order);
	}),

	// CONTRACT: POST /api/orders/{id}/cancel → Order (pre-delivery → Cancelled)
	http.post(CANCEL_URL, async ({ params }) => {
		await delay(300);
		const updated = cancelOrder(Number(params.id));
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: POST /api/orders/{id}/reject → Order (pre-delivery → Rejected by customer)
	http.post(REJECT_URL, async ({ params }) => {
		await delay(300);
		const updated = rejectOrder(Number(params.id));
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: POST /api/orders/{id}/return → Order (Delivered → Returned)
	http.post(RETURN_URL, async ({ params }) => {
		await delay(300);
		const updated = returnOrder(Number(params.id));
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: PUT /api/orders/{id} (UpdateOrderRequest) → Order
	//   Edit an open order (customer, source, address, note, lines). 400 on empty.
	http.put(ITEM_URL, async ({ params, request }) => {
		await delay(350);
		const body = (await request.json()) as Partial<UpdateOrderRequest>;
		const errors: Record<string, string[]> = {};
		if (!Number(body.customerId)) {
			errors.customerId = ["Выберите клиента"];
		}
		if (!Array.isArray(body.lines) || body.lines.length === 0) {
			errors.lines = ["Добавьте хотя бы одну позицию"];
		}
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}
		const updated = updateOrder(Number(params.id), body as UpdateOrderRequest);
		return updated ? HttpResponse.json(updated) : notFound();
	}),

	// CONTRACT: GET /api/orders/{id} → Order · 404 when absent
	http.get(ITEM_URL, async ({ params }) => {
		await delay(250);
		const order = findOrder(Number(params.id));
		return order ? HttpResponse.json(order) : notFound();
	}),
];
