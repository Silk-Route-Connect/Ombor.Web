import { delay, http, HttpResponse } from "msw";

import { CreateTransferLine, CreateTransferRequest } from "../../models/transfer";
import { addTransfer, availableStock, listTransfers, TransferWrite } from "../data/transfer";

/**
 * Origin-agnostic matchers (the axios client targets VITE_OMBOR_API_BASE_URL).
 * The resource is mocked at `/api/transfers` (the backend DTO is stale relative
 * to the redesign — docs/mocking.md). Transfers are immutable: list + create.
 */
const LIST_URL = "*/api/transfers";

function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

function validate(body: Partial<CreateTransferRequest>): {
	errors: Record<string, string[]>;
	write?: TransferWrite;
} {
	const errors: Record<string, string[]> = {};

	const fromWarehouseId = Number(body.fromWarehouseId);
	const toWarehouseId = Number(body.toWarehouseId);
	const rawLines = Array.isArray(body.lines) ? body.lines : [];

	if (!fromWarehouseId) {
		errors.fromWarehouseId = ["Выберите склад-источник"];
	}
	if (!toWarehouseId) {
		errors.toWarehouseId = ["Выберите склад-получатель"];
	}
	if (fromWarehouseId && toWarehouseId && fromWarehouseId === toWarehouseId) {
		errors.toWarehouseId = ["Склады должны быть разными"];
	}

	const lines: CreateTransferLine[] = [];
	if (rawLines.length === 0) {
		errors.lines = ["Добавьте хотя бы одну позицию"];
	} else {
		rawLines.forEach((line, index) => {
			const productId = Number(line?.productId);
			const quantity = Number(line?.quantity);
			if (!productId) {
				errors[`lines[${index}].productId`] = ["Выберите товар"];
			}
			if (!(quantity > 0)) {
				errors[`lines[${index}].quantity`] = ["Количество должно быть больше нуля"];
			}
			// Hard-block negative stock (rule 20): a line can't exceed source stock.
			if (productId && quantity > 0 && fromWarehouseId) {
				const avail = availableStock(productId, fromWarehouseId);
				if (quantity > avail) {
					errors[`lines[${index}].quantity`] = [
						`Недостаточно товара: доступно ${avail}, запрошено ${quantity}`,
					];
				}
			}
			if (productId && quantity > 0) {
				lines.push({ productId, quantity });
			}
		});
	}

	if (Object.keys(errors).length > 0) {
		return { errors };
	}

	return {
		errors,
		write: {
			fromWarehouseId,
			toWarehouseId,
			note: typeof body.note === "string" && body.note.trim() !== "" ? body.note.trim() : null,
			lines,
		},
	};
}

export const transferHandlers = [
	// CONTRACT: GET /api/transfers
	// query: none — full immutable history, newest first (client-side list ops)
	// response 200: Transfer[] (served warehouse/product names + per-line unit)
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listTransfers());
	}),

	// CONTRACT: POST /api/transfers
	// body: CreateTransferRequest { fromWarehouseId; toWarehouseId; note?; lines:
	//       { productId; quantity }[] }
	//   Atomic — both warehouses update at once (rule 16).
	// response 201: Transfer
	// errors: 400 ValidationProblemDetails (same warehouse; required fields; a
	//         line over source availability is hard-blocked — rule 20), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreateTransferRequest>;
		const { errors, write } = validate(body);

		if (!write) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addTransfer(write), { status: 201 });
	}),
];
