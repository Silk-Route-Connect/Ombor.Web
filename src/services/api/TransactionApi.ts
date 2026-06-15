import { TransactionPayment } from "models/payment";
import {
	CreateRefundRequest,
	CreateTransactionEntryRequest,
	GetTransactionsRequest,
	TransactionLine,
	TransactionRecord,
} from "models/transaction";

import BaseApi from "./BaseApi";
import http from "./http";

class TransactionApi extends BaseApi {
	constructor() {
		super("transactions");
	}

	async getAll(request?: GetTransactionsRequest | null): Promise<TransactionRecord[]> {
		const url = this.getUrl(request);
		const response = await http.get<TransactionRecord[]>(url);

		return response.data;
	}

	async getById(id: number): Promise<TransactionRecord> {
		const url = this.getUrlWithId(id);
		const response = await http.get<TransactionRecord>(url);

		return response.data;
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
	 * Create a sale or supply from the redesigned POS entry screen. Posts the JSON
	 * v1 contract (direction, partner, warehouse, lines, single-wallet payment,
	 * settlements, overpayment disposition); the mock computes totals + payment
	 * status and returns the created TransactionRecord.
	 */
	async createTransactionEntry(request: CreateTransactionEntryRequest): Promise<TransactionRecord> {
		const url = this.getUrl();
		const response = await http.post<TransactionRecord>(url, request);

		return response.data;
	}

	/**
	 * Create a refund against a transaction (the only action on an immutable
	 * sale/supply). The mock validates type match, the cumulative-qty cap (rule 5)
	 * and the mandatory reason (rule 7), then appends and returns the refund.
	 */
	async createRefund(id: number, request: CreateRefundRequest): Promise<TransactionRecord> {
		const url = `${this.getUrlWithId(id)}/refund`;
		const response = await http.post<TransactionRecord>(url, request);

		return response.data;
	}
}

export default new TransactionApi();
