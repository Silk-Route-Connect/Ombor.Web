import { DashboardData, DashboardPeriod } from "../../models/dashboard";
import http from "./http";

/**
 * Dashboard API (`/api/dashboard`) for the «Главное» morning-briefing screen — a
 * served, aggregated read model. The debt-derived figures reconcile with «Долги»
 * (rule 12 / hard rule 8).
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
