import { Debt, DebtSummary } from "../../models/debt";
import http from "./http";

/**
 * Debts API (`/api/debts`): the unpaid documents (search, grouping and
 * filtering are client-side over the served list) and the served debt totals.
 * Every figure is server-computed (hard rule 8).
 */
class DebtApi {
	private readonly baseUrl: string = "/api/debts";

	/** Every unpaid / partially-paid document. */
	async getAll(): Promise<Debt[]> {
		const response = await http.get<Debt[]>(this.baseUrl);

		return response.data;
	}

	/** Who owes whom — the net partner positions behind every debt total. */
	async getSummary(): Promise<DebtSummary> {
		const response = await http.get<DebtSummary>(`${this.baseUrl}/summary`);

		return response.data;
	}
}

const debtApi = new DebtApi();
export default debtApi;
