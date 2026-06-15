import { delay, http, HttpResponse } from "msw";

import { DashboardPeriod } from "../../models/dashboard";
import { getDashboard } from "../data/dashboard";

/**
 * Origin-agnostic matcher: the axios client targets VITE_OMBOR_API_BASE_URL, so
 * the `*` host wildcard matches regardless of the configured API base. The
 * «Главное» dashboard is mocked at `/api/dashboard` — there is no backend
 * dashboard endpoint; it is a served, aggregated read model (docs/mocking.md,
 * mocks/data/dashboard.ts). The debt-derived figures reconcile with /api/debts.
 */
const DASHBOARD_URL = "*/api/dashboard";

const PERIODS: DashboardPeriod[] = ["today", "week", "month"];

const parsePeriod = (raw: string | null): DashboardPeriod =>
	PERIODS.includes(raw as DashboardPeriod) ? (raw as DashboardPeriod) : "month";

export const dashboardHandlers = [
	// CONTRACT: GET /api/dashboard?period=today|week|month
	// query: period — defaults to "month". Drives revenue + both charts; the
	//        debt-derived KPIs (receivable / payable / overdue / aging / top
	//        debtors) are a current snapshot, independent of the period.
	// response 200: DashboardData
	// errors: 401
	http.get(DASHBOARD_URL, async ({ request }) => {
		await delay(300);

		const period = parsePeriod(new URL(request.url).searchParams.get("period"));

		return HttpResponse.json(getDashboard(period));
	}),
];
