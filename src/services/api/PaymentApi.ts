import {
	CreatePaymentRecordRequest,
	OutstandingTransaction,
	PaymentFormData,
	PaymentRecord,
} from "../../models/payment";
import BaseApi from "./BaseApi";
import http from "./http";

/**
 * Payments API over the v1 contract (`/api/payments`) for the standalone Платежи
 * page (source/allocation model, business-rules §B). Every derived figure (partner
 * balance + advance, wallet balance, allocation summary) is served. Create is
 * multipart/form-data — it carries file attachments (F18), mirroring
 * TransactionApi.create. The legacy New Sale debt-payment flow posts via
 * TransactionApi and is untouched.
 */
class PaymentApi extends BaseApi {
	constructor() {
		super("payments");
	}

	/** Full collection — newest first; search/filter are client-side in v1. */
	async getAll(): Promise<PaymentRecord[]> {
		const response = await http.get<PaymentRecord[]>(this.baseUrl);

		return response.data;
	}

	async getById(id: number): Promise<PaymentRecord> {
		const response = await http.get<PaymentRecord>(this.getUrlWithId(id));

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

	/**
	 * Record an immutable payment (rule 1). multipart/form-data — flat model-binder
	 * fields plus zero or more `Attachments` file parts (F18). Optional fields are
	 * appended only when present so the model binder sees absent, not "null".
	 */
	async create(request: CreatePaymentRecordRequest): Promise<PaymentRecord> {
		const form = new FormData();
		form.append("Type", request.type);
		form.append("Direction", request.direction);
		form.append("WalletId", String(request.walletId));
		form.append("Amount", String(request.amount));
		if (request.partnerId != null) {
			form.append("PartnerId", String(request.partnerId));
		}
		if (request.employeeId != null) {
			form.append("EmployeeId", String(request.employeeId));
		}
		if (request.description != null) {
			form.append("Description", request.description);
		}
		if (request.period != null) {
			form.append("Period", request.period);
		}
		request.settlements.forEach((s, i) => {
			form.append(`Settlements[${i}].TransactionId`, String(s.transactionId));
			form.append(`Settlements[${i}].Amount`, String(s.amount));
		});
		request.attachments?.forEach((file) => form.append("Attachments", file, file.name));

		const response = await http.post<PaymentRecord>(this.baseUrl, form, this.formHeaders);

		return response.data;
	}
}

const paymentApi = new PaymentApi();
export default paymentApi;
