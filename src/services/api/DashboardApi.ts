import { DashboardPeriod, DashboardSummary } from "models/dashboard";

import { getMockDashboardSummary } from "./mock/dashboardMock";

/**
 * Dashboard data source. The page/store depend on this interface only,
 * so swapping the mock for a real HTTP-backed implementation later is a
 * one-line change at the export below.
 */
export interface IDashboardApi {
	getSummary(period: DashboardPeriod): Promise<DashboardSummary>;
}

/** Simulated network latency for the mock, so loading states are exercised. */
const MOCK_LATENCY_MS = 450;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock implementation — returns deterministic data. Backend is not ready.
 * Replace with an `http`-backed `HttpDashboardApi` when the endpoint exists.
 */
class MockDashboardApi implements IDashboardApi {
	async getSummary(period: DashboardPeriod): Promise<DashboardSummary> {
		await delay(MOCK_LATENCY_MS);
		return getMockDashboardSummary(period);
	}
}

const dashboardApi: IDashboardApi = new MockDashboardApi();

export default dashboardApi;
