import { delay, http, HttpResponse } from "msw";

import { listDebts } from "../data/debt";

/**
 * Origin-agnostic matcher: the axios client targets VITE_OMBOR_API_BASE_URL, so
 * the `*` host wildcard matches regardless of the configured API base. The Долги
 * overview is mocked at `/api/debts` — there is no backend debts endpoint; it is
 * a served, aggregated read model over outstanding transactions (docs/mocking.md,
 * mocks/data/debt.ts).
 */
const LIST_URL = "*/api/debts";

export const debtHandlers = [
	// CONTRACT: GET /api/debts
	// query: none — full set of outstanding (unpaid / partially-paid) transactions
	//        with served remaining / age / overdue (hard rule 8). Search, grouping,
	//        filtering and sorting are client-side.
	// response 200: Debt[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listDebts());
	}),
];
