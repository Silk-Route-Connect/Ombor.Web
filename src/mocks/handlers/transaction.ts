import { delay, http, HttpResponse } from "msw";

import { CreateRefundRequest } from "../../models/transaction";
import { addRefund, findTransaction, listTransactions } from "../data/transaction";

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
