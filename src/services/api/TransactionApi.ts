import { TransactionPayment } from "models/payment";
import {
	CreateTransactionRefundRequest,
	CreateTransactionRequest,
	GetTransactionsRequest,
	TransactionAttachment,
	TransactionLine,
	TransactionPaymentLine,
	TransactionRecord,
	TransactionStatus,
	TransactionType,
} from "models/transaction";

import BaseApi from "./BaseApi";
import http from "./http";

/** Discriminates a refund create (SaleRefund/SupplyRefund) from a sale/supply entry. */
const isRefundRequest = (r: CreateTransactionRequest): r is CreateTransactionRefundRequest =>
	r.type === "SaleRefund" || r.type === "SupplyRefund";

/**
 * Raw transaction as the backend serves it — the list `TransactionDto` (lean) and
 * the detail `TransactionDetailDto` (rich) are a structural superset. Mapped to the
 * frontend `TransactionRecord`: `number`→`transactionNumber`, `date` string→Date,
 * derived `time`, `remaining` defaulted from the totals.
 */
type RawTransaction = {
	id: number;
	number?: string | null;
	partnerId: number;
	partnerName: string;
	date: string;
	type: TransactionType;
	status: TransactionStatus;
	totalDue: number;
	totalPaid: number;
	lines: TransactionLine[] | null;
	originalTransactionId?: number | null;
	refundReason?: string | null;
	// detail-only
	warehouseName?: string | null;
	remaining?: number;
	payments?: TransactionPaymentLine[] | null;
	createdBy?: string | null;
	notes?: string | null;
	attachments?: TransactionAttachment[] | null;
};

const timeOf = (iso: string): string => {
	const d = new Date(iso);
	return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Backend DTO → frontend TransactionRecord (shared by the list + detail). */
const toRecord = (raw: RawTransaction): TransactionRecord => ({
	id: raw.id,
	partnerId: raw.partnerId,
	partnerName: raw.partnerName,
	date: new Date(raw.date),
	transactionNumber: raw.number ?? undefined,
	totalDue: raw.totalDue,
	totalPaid: raw.totalPaid,
	type: raw.type,
	status: raw.status,
	lines: raw.lines ?? [],
	time: timeOf(raw.date),
	warehouseName: raw.warehouseName ?? undefined,
	createdBy: raw.createdBy ?? undefined,
	remaining: raw.remaining ?? Math.max(0, raw.totalDue - raw.totalPaid),
	originalTransactionId: raw.originalTransactionId ?? undefined,
	refundReason: raw.refundReason ?? undefined,
	payments: raw.payments ?? undefined,
	attachments: raw.attachments ?? undefined,
	notes: raw.notes ?? undefined,
});

class TransactionApi extends BaseApi {
	constructor() {
		super("transactions");
	}

	async getAll(request?: GetTransactionsRequest | null): Promise<TransactionRecord[]> {
		const url = this.getUrl(request);
		const response = await http.get<RawTransaction[]>(url);

		return response.data.map(toRecord);
	}

	async getById(id: number): Promise<TransactionRecord> {
		const url = this.getUrlWithId(id);
		const response = await http.get<RawTransaction>(url);

		return toRecord(response.data);
	}

	async getPayments(transactionId: number): Promise<TransactionPayment[]> {
		const url = `${this.getUrlWithId(transactionId)}/payments`;
		const response = await http.get<TransactionPayment[]>(url);

		return response.data;
	}

	async getLines(transactionId: number): Promise<TransactionLine[]> {
		const url = `${this.getUrlWithId(transactionId)}/lines`;
		const response = await http.get<TransactionLine[]>(url);

		return response.data;
	}

	/**
	 * Create a transaction through the single immutable create path: a sale/supply
	 * entry (from the POS) or a refund (type SaleRefund/SupplyRefund) — the server
	 * branches on `type`. Sent as multipart/form-data with **flat, indexed form
	 * fields** (the ASP.NET model-binder shape: `Lines[0].ProductId`, …), plus the
	 * `Attachments` file parts. Returns the created transaction mapped through
	 * {@link toRecord} — the store prepends it into the live feed, so it must
	 * carry a real `Date` (the wire `date` is an ISO string) and the derived fields.
	 */
	async create(request: CreateTransactionRequest): Promise<TransactionRecord> {
		const form = new FormData();
		form.append("Type", request.type);

		if (isRefundRequest(request)) {
			form.append("PartnerId", String(request.partnerId));
			form.append("OriginalTransactionId", String(request.originalTransactionId));
			form.append("RefundReason", request.refundReason);
			request.lines.forEach((line, i) => {
				form.append(`Lines[${i}].ProductId`, String(line.productId));
				form.append(`Lines[${i}].Quantity`, String(line.quantity));
				form.append(`Lines[${i}].UnitPrice`, String(line.unitPrice));
				form.append(`Lines[${i}].Discount`, "0");
				form.append(`Lines[${i}].DiscountType`, "Percentage");
			});
		} else {
			form.append("PartnerId", String(request.partnerId));
			form.append("WarehouseId", String(request.warehouseId));
			form.append("WalletId", String(request.walletId));
			form.append("PaidAmount", String(request.paidAmount));
			form.append("Overpayment", request.overpayment === "advance" ? "Advance" : "Change");
			if (request.notes) {
				form.append("Notes", request.notes);
			}
			request.lines.forEach((line, i) => {
				form.append(`Lines[${i}].ProductId`, String(line.productId));
				form.append(`Lines[${i}].Quantity`, String(line.quantity));
				form.append(`Lines[${i}].UnitPrice`, String(line.unitPrice));
				form.append(`Lines[${i}].Discount`, String(line.discount));
				form.append(`Lines[${i}].DiscountType`, line.discountType);
			});
			request.settlements.forEach((s, i) => {
				form.append(`Settlements[${i}].TransactionId`, String(s.transactionId));
				form.append(`Settlements[${i}].Amount`, String(s.amount));
			});
			request.attachments?.forEach((file) => form.append("Attachments", file, file.name));
		}

		const response = await http.post<RawTransaction>(this.getUrl(), form, this.formHeaders);

		return toRecord(response.data);
	}
}

export default new TransactionApi();
