import { delay, http, HttpResponse, passthrough } from "msw";

import { CreateRefundRequest, CreateTransactionEntryRequest } from "../../models/transaction";
import { MEASUREMENT_SHORT } from "../../utils/productUtils";
import { findPartner } from "../data/partner";
import { findProduct } from "../data/product";
import {
	addRefund,
	addTransactionEntry,
	findTransaction,
	listTransactions,
} from "../data/transaction";
import { findWarehouse } from "../data/warehouse";

/**
 * Origin-agnostic matchers. The redesigned Sales/Supplies pages read the whole
 * transaction collection (sales + supplies + refunds) and create refunds; the
 * read side + refund are mocked at the v1 contract (docs/mocking.md). The legacy
 * `POST /api/transactions` create flow (New Sale / New Supply) is intentionally
 * NOT handled here — it passes through untouched.
 */
const LIST_URL = "*/api/transactions";
const ITEM_URL = "*/api/transactions/:id";
const REFUND_URL = "*/api/transactions/:id/refund";

function validationProblem(errors: Record<string, string[]>, status = 400) {
	return HttpResponse.json(
		{ status, title: "One or more validation errors occurred.", errors },
		{ status },
	);
}

export const transactionHandlers = [
	// CONTRACT: GET /api/transactions
	// query: none — full collection (Sales + Supplies + refunds), newest-first;
	//   client filters by direction + search/status/date. Each record carries
	//   computed totalDue/totalPaid/remaining, paymentStatus, lines (with discount
	//   type), payments, createdBy, warehouse, and refund linkage.
	// response 200: TransactionDto[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);
		return HttpResponse.json(listTransactions());
	}),

	// CONTRACT: POST /api/transactions  (redesigned POS New Sale / New Supply — JSON)
	// body: CreateTransactionEntryRequest { direction; partnerId; warehouseId; lines[];
	//   walletId; paidAmount; settlements[]; overpayment; notes?; attachments? }. Validates
	//   partner, warehouse and at least one positive-qty line, then creates the transaction
	//   (totals computed from lines). Settlement/overpayment handling is illustrative — the
	//   self-contained mock doesn't mutate stock / partner balance / wallet balance.
	// Any non-JSON (legacy multipart) POST to the same URL is passed through.
	// response 201: TransactionDto (the created sale/supply)
	// errors: 400 ValidationProblemDetails, 401
	http.post(LIST_URL, async ({ request }) => {
		if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
			return passthrough();
		}

		await delay(350);
		const body = (await request.json()) as Partial<CreateTransactionEntryRequest>;
		const direction = body.direction === "Supply" ? "Supply" : "Sale";
		const errors: Record<string, string[]> = {};

		const partner = body.partnerId ? findPartner(body.partnerId) : undefined;
		const warehouse = body.warehouseId ? findWarehouse(body.warehouseId) : undefined;
		const lines = (body.lines ?? []).filter((l) => l.quantity > 0);

		if (!partner) {
			errors.partnerId = [direction === "Supply" ? "Выберите поставщика" : "Выберите партнёра"];
		}
		if (!warehouse) {
			errors.warehouseId = ["Выберите склад"];
		}
		if (lines.length === 0) {
			errors.lines = ["Добавьте хотя бы одну позицию"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		const record = addTransactionEntry({
			direction,
			partnerId: partner!.id,
			partnerName: partner!.name,
			warehouseName: warehouse!.name,
			createdBy: "Бахром Саидов",
			notes: body.notes,
			paidAmount: Number(body.paidAmount) || 0,
			attachments: body.attachments ?? [],
			lines: lines.map((l) => {
				const product = findProduct(l.productId);
				return {
					productId: l.productId,
					productName: product?.name ?? `#${l.productId}`,
					unit: product ? MEASUREMENT_SHORT[product.measurement] : undefined,
					quantity: l.quantity,
					unitPrice: l.unitPrice,
					discount: l.discount,
					discountType: l.discountType,
				};
			}),
		});

		return HttpResponse.json(record, { status: 201 });
	}),

	// CONTRACT: POST /api/transactions/{id}/refund
	// body: CreateRefundRequest { reason; lines: { productId; productName; quantity; unitPrice }[] }
	//   Validates type match (refund of a sale/supply, never of a refund — rule 4),
	//   mandatory reason (rule 7) and the cumulative per-line cap (rule 5).
	// response 201: TransactionDto (the created refund)
	// errors: 400 ValidationProblemDetails, 404, 401
	http.post(REFUND_URL, async ({ params, request }) => {
		await delay(350);
		const body = (await request.json()) as CreateRefundRequest;
		const result = addRefund(Number(params.id), body);
		if (!result.ok) {
			if (result.status === 404) {
				return new HttpResponse(null, { status: 404 });
			}
			return validationProblem(result.errors, result.status);
		}
		return HttpResponse.json(result.refund, { status: 201 });
	}),

	// CONTRACT: GET /api/transactions/{id} → TransactionDto (enriched + payments)
	// errors: 404
	http.get(ITEM_URL, async ({ params }) => {
		await delay(250);
		const transaction = findTransaction(Number(params.id));
		if (!transaction) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(transaction);
	}),
];
