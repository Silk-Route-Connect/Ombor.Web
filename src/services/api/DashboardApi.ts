import { DashboardData, DashboardPeriod } from "../../models/dashboard";
import http from "./http";

/**
 * Dashboard API over the target v1 contract (`/api/dashboard`) for the «Главное»
 * morning-briefing screen. The resource is mocked (docs/mocking.md) — there is no
 * backend dashboard endpoint; it is a served, aggregated read model. The
 * debt-derived figures reconcile with the «Долги» mock (rule 12 / hard rule 8).
 */
class DashboardApi {
	private readonly baseUrl: string = "/api/dashboard";

	/** Full dashboard snapshot for the given period. */
	async get(period: DashboardPeriod): Promise<DashboardData> {
		const response = await http.get<DashboardData>(this.baseUrl, { params: { period } });

		return response.data;
	}
}

const dashboardApi = new DashboardApi();
export default dashboardApi;
