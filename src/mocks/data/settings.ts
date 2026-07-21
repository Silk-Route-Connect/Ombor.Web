import { ContactType, InviteUserRequest, Organization, TenantUser } from "../../models/settings";

/**
 * In-memory seed + mutators for the «Настройки» mock. No backend endpoint exists
 * for the organization profile or user management (only /api/auth/*), so this is
 * mocked at the target v1 contract (docs/mocking.md). Self-contained and mutable:
 * a PUT updates the stored org; invite / deactivate / reactivate mutate the user
 * list in place, so the changes persist across refetches within the session.
 */

const HOUR = 3_600_000;
const DAY = 86_400_000;
const now = Date.now();

let organization: Organization = {
	name: "Никитин Маркет",
	address: "ул. Навои 42, Ташкент",
	phone: "+998 90 123-45-67",
	email: "info@nikitin-market.uz",
	logoUrl: null,
};

let users: TenantUser[] = [
	{
		id: 1,
		name: "Бахром Саидов",
		contact: "bakhrom@nikitin.uz",
		contactType: "email",
		active: true,
		self: true,
		online: true,
		lastActiveAt: new Date(now).toISOString(),
	},
	{
		id: 2,
		name: "Дилноза Каримова",
		contact: "dilnoza@nikitin.uz",
		contactType: "email",
		active: true,
		self: false,
		online: false,
		lastActiveAt: new Date(now - 2 * HOUR).toISOString(),
	},
	{
		id: 3,
		name: "Азиз Рахматов",
		contact: "aziz@nikitin.uz",
		contactType: "email",
		active: true,
		self: false,
		online: false,
		lastActiveAt: new Date(now - 1 * DAY).toISOString(),
	},
	{
		id: 4,
		name: "Жасур Тураев",
		contact: "jasur@nikitin.uz",
		contactType: "email",
		active: false,
		self: false,
		online: false,
		lastActiveAt: new Date(now - 32 * DAY).toISOString(),
	},
];

let nextId = 5;

export function getOrganization(): Organization {
	return { ...organization };
}

export function updateOrganization(patch: Organization): Organization {
	organization = { ...patch };
	return { ...organization };
}

export function listUsers(): TenantUser[] {
	return users.map((u) => ({ ...u }));
}

/** Derives a display name from the contact (mock — a real invite has no name yet). */
function nameFromContact(method: ContactType, value: string): string {
	return method === "email" ? value.split("@")[0] : value;
}

export function inviteUser(req: InviteUserRequest): TenantUser {
	const user: TenantUser = {
		id: nextId++,
		name: nameFromContact(req.method, req.value),
		contact: req.value,
		contactType: req.method,
		active: true,
		self: false,
		online: false,
		lastActiveAt: null,
	};
	users = [...users, user];
	return { ...user };
}

export function setUserActive(id: number, active: boolean): TenantUser | null {
	const user = users.find((u) => u.id === id);
	if (!user) {
		return null;
	}
	user.active = active;
	if (!active) {
		user.online = false;
		user.lastActiveAt = new Date().toISOString();
	}
	return { ...user };
}
