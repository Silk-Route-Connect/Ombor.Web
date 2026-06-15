import { delay, http, HttpResponse } from "msw";

import { CreatePaymentRecordRequest } from "../../models/payment";
import {
	addPayment,
	findPayment,
	listOutstanding,
	listPayments,
	paymentFormData,
} from "../data/payment";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL,
 * so the `*` host wildcard matches regardless of the configured API base. The
 * redesigned standalone Payments page is mocked at `/api/payments` — the live
 * backend DTO is the legacy removed-enum model (docs/mocking.md,
 * mocks/data/payment.ts). The legacy `/api/payments` create flow used by New
 * Sale is untouched (it posts the legacy shape via TransactionApi, not here).
 *
 * Route order matters: `/form-data` and `/outstanding` are registered before the
 * `/:id` matcher so they aren't captured as ids.
 */
const LIST_URL = "*/api/payments";
const FORM_DATA_URL = "*/api/payments/form-data";
const OUTSTANDING_URL = "*/api/payments/outstanding";
const ITEM_URL = "*/api/payments/:id";

function problem(status: number, title: string, detail?: string) {
	return HttpResponse.json({ status, title, detail }, { status });
}

function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

export const paymentHandlers = [
	// CONTRACT: GET /api/payments
	// query: none — full dataset, newest first (client-side search/filter).
	//        Served direction / wallet / partner / allocation summary (rule 12).
	// response 200: PaymentRecord[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listPayments());
	}),

	// CONTRACT: GET /api/payments/form-data
	// Reference data for the create modal — partners (served balance + advance),
	// active employees (salary + position), wallets (served balance).
	// response 200: PaymentFormData
	// errors: 401
	http.get(FORM_DATA_URL, async () => {
		await delay(200);

		return HttpResponse.json(paymentFormData());
	}),

	// CONTRACT: GET /api/payments/outstanding?partnerId={id}
	// The partner's open (unpaid / partially-paid) transactions for the settlement
	// modal, oldest first (FIFO order).
	// response 200: OutstandingTransaction[]
	// errors: 400 (missing partnerId), 401
	http.get(OUTSTANDING_URL, async ({ request }) => {
		await delay(200);

		const partnerId = Number(new URL(request.url).searchParams.get("partnerId"));
		if (!partnerId) {
			return problem(400, "Bad Request", "partnerId обязателен");
		}

		return HttpResponse.json(listOutstanding(partnerId));
	}),

	// CONTRACT: GET /api/payments/:id
	// response 200: PaymentRecord
	// errors: 404 ProblemDetails, 401
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const payment = findPayment(Number(params.id));
		if (!payment) {
			return problem(404, "Not Found", "Платёж не найден");
		}

		return HttpResponse.json(payment);
	}),

	// CONTRACT: POST /api/payments
	// body: CreatePaymentRecordRequest. An immutable payment (rule 1). Sources
	//   balance settling allocations (rule 8); excess on a Transaction payment
	//   becomes an AdvanceCredit. Payroll allows any number of payments per month
	//   (no per-period constraint — business-rules Employee section).
	// response 201: PaymentRecord
	// errors: 400 ValidationProblemDetails, 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreatePaymentRecordRequest>;
		const errors: Record<string, string[]> = {};

		const type = body.type;
		const partnerTypes = ["Transaction", "Deposit", "Withdrawal"];

		if (!type) {
			errors.type = ["Выберите тип платежа"];
		}
		if (type && partnerTypes.includes(type) && !body.partnerId) {
			errors.partnerId = ["Выберите партнёра"];
		}
		if (type === "Payroll" && !body.employeeId) {
			errors.employeeId = ["Выберите сотрудника"];
		}
		if (!body.walletId) {
			errors.walletId = ["Выберите кассу"];
		}
		if (!(Number(body.amount) > 0)) {
			errors.amount = ["Введите сумму платежа"];
		}
		if (type === "General" && !(body.description ?? "").trim()) {
			errors.description = ["Укажите описание платежа"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		const record = addPayment({
			type: type!,
			direction: body.direction ?? "Income",
			partnerId: body.partnerId ?? null,
			employeeId: body.employeeId ?? null,
			walletId: body.walletId!,
			amount: Number(body.amount),
			description: body.description ?? null,
			period: body.period ?? null,
			settlements: Array.isArray(body.settlements) ? body.settlements : [],
		});

		return HttpResponse.json(record, { status: 201 });
	}),
];
