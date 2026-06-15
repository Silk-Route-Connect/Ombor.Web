import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentFormData,
	PaymentRecord,
} from "../../models/payment";
import http from "./http";

/**
 * Payments API over the target v1 contract (`/api/payments`) for the redesigned
 * standalone Платежи page. The resource is mocked (docs/mocking.md) — the live
 * backend DTO is the legacy removed-enum model (method / currency / exchangeRate),
 * stale for the source/allocation model (business-rules §B). All derived figures
 * (partner balance + advance, wallet balance, allocation summary) are served.
 * The legacy New Sale debt-payment flow posts the legacy shape via TransactionApi
 * and is untouched.
 */
class PaymentApi {
	private readonly baseUrl: string = "/api/payments";

	/** Full collection — newest first; search/filter are client-side in v1. */
	async getAll(): Promise<PaymentRecord[]> {
		const response = await http.get<PaymentRecord[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<PaymentRecord> {
		const response = await http.get<PaymentRecord>(`${this.baseUrl}/${id}`);

		return response.data;
	}

	/** Reference data for the create modal (partners, employees, wallets). */
	async getFormData(): Promise<PaymentFormData> {
		const response = await http.get<PaymentFormData>(`${this.baseUrl}/form-data`);

		return response.data;
	}

	/** A partner's open transactions for the settlement modal (FIFO order). */
	async getOutstanding(partnerId: number): Promise<OutstandingTransaction[]> {
		const response = await http.get<OutstandingTransaction[]>(`${this.baseUrl}/outstanding`, {
			params: { partnerId },
		});

		return response.data;
	}

	/** Record an immutable payment (rule 1). */
	async create(request: CreatePaymentRecordRequest): Promise<PaymentRecord> {
		const response = await http.post<PaymentRecord>(this.baseUrl, request);

		return response.data;
	}
}

const paymentApi = new PaymentApi();
export default paymentApi;
