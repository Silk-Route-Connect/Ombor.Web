import { delay, http, HttpResponse } from "msw";

import { CreatePartnerRequest, PartnerType, UpdatePartnerRequest } from "../../models/partner";
import {
	addPartner,
	deletePartner,
	findPartner,
	getPartnerLedger,
	listPartners,
	setPartnerArchived,
	updatePartner,
} from "../data/partner";

/**
 * Origin-agnostic matchers (the axios client targets VITE_OMBOR_API_BASE_URL).
 * The whole resource is mocked at `/api/partners` — the live contract has no
 * server-computed balance, opening-balance event, archive/restore, or ledger
 * (docs/mocking.md; tech-change-list: not started).
 */
const LIST_URL = "*/api/partners";
const ITEM_URL = "*/api/partners/:id";
const LEDGER_URL = "*/api/partners/:id/ledger";
const PAYMENTS_URL = "*/api/partners/:id/payments";
const ARCHIVE_URL = "*/api/partners/:id/archive";
const RESTORE_URL = "*/api/partners/:id/restore";

const VALID_TYPES: PartnerType[] = ["Customer", "Supplier", "Both"];

function validationProblem(errors: Record<string, string[]>, status = 400) {
	return HttpResponse.json(
		{ status, title: "One or more validation errors occurred.", errors },
		{ status },
	);
}

function validate(body: Partial<CreatePartnerRequest>): Record<string, string[]> {
	const errors: Record<string, string[]> = {};

	if (!body.name || body.name.trim().length < 2) {
		errors.name = ["Имя должно содержать минимум 2 символа"];
	}
	if (!VALID_TYPES.includes(body.type as PartnerType)) {
		errors.type = ["Выберите тип партнёра"];
	}
	const phones = Array.isArray(body.phoneNumbers)
		? body.phoneNumbers.filter((p) => typeof p === "string" && p.trim() !== "")
		: [];
	if (phones.length === 0) {
		errors.phoneNumbers = ["Укажите хотя бы один номер телефона"];
	}

	return errors;
}

export const partnerHandlers = [
	// CONTRACT: GET /api/partners
	// query: none — full collection incl. archived (client-side list ops)
	// response 200: Partner[] (server-computed balance, opening event, isArchived,
	//               isDeletable, activityCount)
	// errors: 401
	http.get(LIST_URL, async () => {
		await delay(300);
		return HttpResponse.json(listPartners());
	}),

	// CONTRACT: POST /api/partners
	// body: CreatePartnerRequest { type; name; companyName?; address?; email?;
	//       telegram?; phoneNumbers[]; openingBalance } (opening balance is recorded
	//       as the first, immutable ledger event)
	// response 201: Partner
	// errors: 400 ValidationProblemDetails, 401
	http.post(LIST_URL, async ({ request }) => {
		await delay(350);
		const body = (await request.json()) as Partial<CreatePartnerRequest>;
		const errors = validate(body);
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}
		return HttpResponse.json(addPartner(body as CreatePartnerRequest), { status: 201 });
	}),

	// CONTRACT: GET /api/partners/{id}/ledger
	// query: none — newest-first running-balance ledger; reconciles to balance
	// response 200: PartnerLedgerEntry[]
	// errors: 404
	http.get(LEDGER_URL, async ({ params }) => {
		await delay(250);
		const ledger = getPartnerLedger(Number(params.id));
		if (!ledger) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(ledger);
	}),

	// CONTRACT: GET /api/partners/{id}/payments — legacy, consumed by the
	// transaction flow. The redesigned ledger supersedes it; the mock returns
	// an empty list so the legacy flow doesn't error.
	http.get(PAYMENTS_URL, async () => {
		await delay(150);
		return HttpResponse.json([]);
	}),

	// CONTRACT: GET /api/partners/{id} → Partner; errors: 404
	http.get(ITEM_URL, async ({ params }) => {
		await delay(250);
		const partner = findPartner(Number(params.id));
		if (!partner) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(partner);
	}),

	// CONTRACT: PUT /api/partners/{id}
	// body: UpdatePartnerRequest (never the opening balance — it is locked)
	// response 200: Partner; errors: 400, 404
	http.put(ITEM_URL, async ({ params, request }) => {
		await delay(350);
		const body = (await request.json()) as Partial<UpdatePartnerRequest>;
		const errors = validate(body);
		if (Object.keys(errors).length > 0) {
			return validationProblem(errors);
		}
		const updated = updatePartner(Number(params.id), body as UpdatePartnerRequest);
		if (!updated) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(updated);
	}),

	// CONTRACT: POST /api/partners/{id}/archive → Partner (soft-delete, rule 29)
	http.post(ARCHIVE_URL, async ({ params }) => {
		await delay(300);
		const updated = setPartnerArchived(Number(params.id), true);
		if (!updated) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(updated);
	}),

	// CONTRACT: POST /api/partners/{id}/restore → Partner
	http.post(RESTORE_URL, async ({ params }) => {
		await delay(300);
		const updated = setPartnerArchived(Number(params.id), false);
		if (!updated) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(updated);
	}),

	// CONTRACT: DELETE /api/partners/{id}
	// response 204 when unreferenced; 409 ValidationProblemDetails when other
	// entities reference the partner (then it must be archived instead); 404
	http.delete(ITEM_URL, async ({ params }) => {
		await delay(300);
		const result = deletePartner(Number(params.id));
		if (result.referenced) {
			return validationProblem(
				{ partner: ["На партнёра ссылаются другие записи — его нельзя удалить."] },
				409,
			);
		}
		if (!result.ok) {
			return new HttpResponse(null, { status: 404 });
		}
		return new HttpResponse(null, { status: 204 });
	}),
];
