import { Debt } from "../../models/debt";
import http from "./http";

/**
 * Debts API over the target v1 contract (`/api/debts`) for the redesigned «Долги»
 * overview. The resource is mocked (docs/mocking.md) — there is no backend debts
 * endpoint; it is a served, aggregated read model over unpaid / partially-paid
 * transactions. Remaining / age / overdue are server-computed (hard rule 8).
 * Search, grouping, filtering and sorting are client-side over the served list.
 */
class DebtApi {
	private readonly baseUrl: string = "/api/debts";

	/** Full collection of outstanding transactions. */
	async getAll(): Promise<Debt[]> {
		const response = await http.get<Debt[]>(this.baseUrl);

		return response.data;
	}
}

const debtApi = new DebtApi();
export default debtApi;
