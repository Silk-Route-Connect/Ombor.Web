import { delay, http, HttpResponse } from "msw";

import {
	CreateRefundRequest,
	CreateTransactionEntryRequest,
	TransactionAttachment,
} from "../../models/transaction";
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
 * transaction collection (sales + supplies + refunds), create sales/supplies
 * (multipart) and create refunds (JSON) — all mocked at the v1 contract
 * (docs/mocking.md).
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

/** Derive the served attachment metadata from an uploaded multipart file part. */
const fileKind = (name: string): TransactionAttachment["kind"] =>
	/\.(png|jpe?g|gif|webp|bmp)$/i.test(name) ? "img" : "pdf";

const fileSize = (bytes: number): string =>
	bytes >= 1_048_576
		? `${(bytes / 1_048_576).toFixed(1)} МБ`
		: `${Math.max(1, Math.round(bytes / 1024))} КБ`;

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

	// CONTRACT: POST /api/transactions  (redesigned POS New Sale / New Supply)
	// Content-Type: multipart/form-data with two kinds of part:
	//   • `payload`  — one JSON part: CreateTransactionEntryRequest minus files
	//                  { direction; partnerId; warehouseId; lines[]; walletId; paidAmount;
	//                    settlements[]; overpayment; notes? }
	//   • `attachments` — zero or more binary file parts (receipts / invoices / photos)
	// The structured body is sent as a single JSON part (too nested to flatten into form
	// fields), and JSON alone can't carry binaries — hence multipart. **The real backend must
	// persist each file to blob storage and return served attachment metadata (name/kind/size
	// + a url/id) on the transaction.** This self-contained mock stores attachment METADATA
	// ONLY (no binary store) and doesn't mutate stock / partner balance / wallet balance;
	// settlement/overpayment handling is illustrative. Validates partner, warehouse and ≥1
	// positive-qty line; totals computed from lines.
	// response 201: TransactionDto (the created sale/supply)
	// errors: 400 ValidationProblemDetails, 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);
		const form = await request.formData();
		const payloadRaw = form.get("payload");
		const body = (
			typeof payloadRaw === "string" ? JSON.parse(payloadRaw) : {}
		) as Partial<CreateTransactionEntryRequest>;
		const files = form.getAll("attachments").filter((f): f is File => f instanceof File);
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
			attachments: files.map((f) => ({
				name: f.name,
				kind: fileKind(f.name),
				size: fileSize(f.size),
			})),
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
