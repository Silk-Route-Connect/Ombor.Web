import { delay, http, HttpResponse } from "msw";

import { CreateTransferRequest, CreateWalletRequest, WALLET_TYPES } from "../../models/wallet";
import {
	addTransfer,
	addWallet,
	editWallet,
	findWallet,
	listWalletOperations,
	listWallets,
	listWalletTransfers,
	setWalletArchived,
	walletNameExists,
} from "../data/wallet";

/**
 * Origin-agnostic matchers: the axios client targets VITE_OMBOR_API_BASE_URL
 * (a different origin than the dev server), so the `*` host wildcard matches
 * regardless of the configured API base. The whole wallets resource is mocked
 * at `/api/wallets` — the backend has no wallet entity yet (tech-change-list:
 * "Wallet entity — not started"; docs/mocking.md, mocks/data/wallet.ts).
 *
 * Route order matters: `/api/wallets/transfers` must be registered before the
 * `/api/wallets/:id` matchers so it isn't captured as an id.
 */
const LIST_URL = "*/api/wallets";
const TRANSFERS_CREATE_URL = "*/api/wallets/transfers";
const ITEM_URL = "*/api/wallets/:id";
const OPERATIONS_URL = "*/api/wallets/:id/operations";
const TRANSFERS_URL = "*/api/wallets/:id/transfers";
const ARCHIVE_URL = "*/api/wallets/:id/archive";
const RESTORE_URL = "*/api/wallets/:id/restore";

const NAME_MIN = 2;
const NAME_MAX = 250;

/** ASP.NET ProblemDetails (matches the backend's error shape — see openapi.json). */
function problem(status: number, title: string, detail?: string) {
	return HttpResponse.json({ status, title, detail }, { status });
}

/** ValidationProblemDetails: field-keyed `errors` map. */
function validationProblem(errors: Record<string, string[]>) {
	return HttpResponse.json(
		{ status: 400, title: "One or more validation errors occurred.", errors },
		{ status: 400 },
	);
}

export const walletHandlers = [
	// CONTRACT: GET /api/wallets
	// query: none — full dataset, archived included (carry the isArchived flag;
	//        client-side search/filter). Served balance / advancesHeld / ourMoney
	//        (hard rule 8 / rule 12); an archived wallet still holding money still
	//        reports them (rule 31).
	// response 200: Wallet[]
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);

		return HttpResponse.json(listWallets());
	}),

	// CONTRACT: POST /api/wallets/transfers
	// body: CreateTransferRequest { fromWalletId; toWalletId; amount; note? }
	//   An audited, immutable inter-wallet transfer (rule 16). Adjusts both
	//   wallets' served balances and appends an operation to each side.
	// response 201: WalletTransfer
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.post(TRANSFERS_CREATE_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreateTransferRequest>;
		const fromWalletId = Number(body.fromWalletId);
		const toWalletId = Number(body.toWalletId);
		const amount = Number(body.amount);
		const note = typeof body.note === "string" && body.note.trim() !== "" ? body.note.trim() : null;

		const from = findWallet(fromWalletId);
		const to = findWallet(toWalletId);
		const errors: Record<string, string[]> = {};

		if (!from) {
			errors.fromWalletId = ["Выберите кассу-источник"];
		}
		if (!to) {
			errors.toWalletId = ["Выберите кассу-получатель"];
		} else if (fromWalletId === toWalletId) {
			errors.toWalletId = ["Касса-получатель должна отличаться от источника"];
		}
		if (!(amount > 0)) {
			errors.amount = ["Введите сумму перевода"];
		} else if (from && amount > from.balance) {
			errors.amount = [`Доступно только ${from.balance} — нельзя перевести больше остатка`];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addTransfer(fromWalletId, toWalletId, amount, note), { status: 201 });
	}),

	// CONTRACT: GET /api/wallets/:id
	// response 200: Wallet
	// errors: 404 ProblemDetails, 401
	http.get(ITEM_URL, async ({ params }) => {
		await delay(200);

		const wallet = findWallet(Number(params.id));
		if (!wallet) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		return HttpResponse.json(wallet);
	}),

	// CONTRACT: GET /api/wallets/:id/operations
	// query: none — full operations ledger, newest first (client-side list ops);
	//        `balanceAfter` is the served running balance (hard rule 8).
	// response 200: WalletOperation[]
	// errors: 404 ProblemDetails, 401
	http.get(OPERATIONS_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findWallet(id)) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		return HttpResponse.json(listWalletOperations(id));
	}),

	// CONTRACT: GET /api/wallets/:id/transfers
	// query: none — inter-wallet transfers touching this wallet, newest first.
	// response 200: WalletTransfer[]
	// errors: 404 ProblemDetails, 401
	http.get(TRANSFERS_URL, async ({ params }) => {
		await delay(250);

		const id = Number(params.id);
		if (!findWallet(id)) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		return HttpResponse.json(listWalletTransfers(id));
	}),

	// CONTRACT: POST /api/wallets
	// body: CreateWalletRequest { name; type: Cash|Card|Bank; openingBalance >= 0 }
	//   The opening balance is recorded as an auditable event (rule 16); the new
	//   wallet starts at that balance with zero advances held.
	// response 201: Wallet
	// errors: 400 ValidationProblemDetails (name / type / opening), 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);

		const body = (await request.json()) as Partial<CreateWalletRequest>;
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const type = body.type;
		const openingBalance = Number(body.openingBalance);
		const errors: Record<string, string[]> = {};

		if (name.length < NAME_MIN) {
			errors.name = ["Введите название кассы (минимум 2 символа)"];
		} else if (name.length > NAME_MAX) {
			errors.name = [`Название не должно превышать ${NAME_MAX} символов`];
		} else if (walletNameExists(name)) {
			errors.name = ["Касса с таким названием уже существует"];
		}
		if (!type || !WALLET_TYPES.includes(type)) {
			errors.type = ["Выберите тип кассы"];
		}
		if (!Number.isFinite(openingBalance) || openingBalance < 0) {
			errors.openingBalance = ["Начальный баланс не может быть отрицательным"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(addWallet({ name, type: type!, openingBalance }), { status: 201 });
	}),

	// CONTRACT: PUT /api/wallets/:id
	// body: UpdateWalletRequest { id; name } — name only; type and opening balance
	//   are immutable auditable facts (rule 16) and ignored if sent.
	// response 200: Wallet
	// errors: 400 ValidationProblemDetails, 404 ProblemDetails, 401
	http.put(ITEM_URL, async ({ request, params }) => {
		await delay(350);

		const id = Number(params.id);
		if (!findWallet(id)) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		const body = (await request.json()) as { name?: string };
		const name = typeof body.name === "string" ? body.name.trim() : "";
		const errors: Record<string, string[]> = {};

		if (name.length < NAME_MIN) {
			errors.name = ["Введите название кассы (минимум 2 символа)"];
		} else if (name.length > NAME_MAX) {
			errors.name = [`Название не должно превышать ${NAME_MAX} символов`];
		} else if (walletNameExists(name, id)) {
			errors.name = ["Касса с таким названием уже существует"];
		}

		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}

		return HttpResponse.json(editWallet(id, name));
	}),

	// CONTRACT: POST /api/wallets/:id/archive
	// Soft-delete (rule 29); an archived wallet with residual money still counts
	// in totals (rule 31).
	// response 204: No Content
	// errors: 404 ProblemDetails, 401
	http.post(ARCHIVE_URL, async ({ params }) => {
		await delay(250);

		const updated = setWalletArchived(Number(params.id), true);
		if (!updated) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		return new HttpResponse(null, { status: 204 });
	}),

	// CONTRACT: POST /api/wallets/:id/restore
	// response 204: No Content
	// errors: 404 ProblemDetails, 401
	http.post(RESTORE_URL, async ({ params }) => {
		await delay(250);

		const updated = setWalletArchived(Number(params.id), false);
		if (!updated) {
			return problem(404, "Not Found", "Касса не найдена");
		}

		return new HttpResponse(null, { status: 204 });
	}),
];
