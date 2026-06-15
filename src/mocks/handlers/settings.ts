import { delay, http, HttpResponse } from "msw";

import { InviteUserRequest, Organization } from "../../models/settings";
import {
	getOrganization,
	inviteUser,
	listUsers,
	setUserActive,
	updateOrganization,
} from "../data/settings";

/**
 * «Настройки» mocked at the target v1 contract — there is no backend for the
 * organization profile or user management yet (only /api/auth/*). Origin-agnostic
 * `*` host so it matches regardless of VITE_OMBOR_API_BASE_URL.
 */
const ORG_URL = "*/api/settings/organization";
const USERS_URL = "*/api/settings/users";
const INVITE_URL = "*/api/settings/users/invite";
const USER_STATUS_URL = "*/api/settings/users/:id/:action"; // action = deactivate | reactivate

export const settingsHandlers = [
	// CONTRACT: GET /api/settings/organization → Organization
	http.get(ORG_URL, async () => {
		await delay(250);
		return HttpResponse.json(getOrganization());
	}),

	// CONTRACT: PUT /api/settings/organization (body: Organization) → Organization
	http.put(ORG_URL, async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as Organization;
		return HttpResponse.json(updateOrganization(body));
	}),

	// CONTRACT: GET /api/settings/users → TenantUser[]
	http.get(USERS_URL, async () => {
		await delay(250);
		return HttpResponse.json(listUsers());
	}),

	// CONTRACT: POST /api/settings/users/invite (body: InviteUserRequest) → TenantUser
	http.post(INVITE_URL, async ({ request }) => {
		await delay(300);
		const body = (await request.json()) as InviteUserRequest;
		return HttpResponse.json(inviteUser(body), { status: 201 });
	}),

	// CONTRACT: POST /api/settings/users/{id}/{deactivate|reactivate} → TenantUser
	// Users are never deleted (rule 41) — only the active flag flips.
	http.post(USER_STATUS_URL, async ({ params }) => {
		await delay(250);
		const id = Number(params.id);
		const active = params.action === "reactivate";
		const user = setUserActive(id, active);
		if (!user) {
			return new HttpResponse(null, { status: 404 });
		}
		return HttpResponse.json(user);
	}),
];
