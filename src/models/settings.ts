/**
 * «Настройки» (Settings) — mvp-plan §18. Two server-backed concerns: the
 * organization profile and the tenant's users. There is no backend endpoint for
 * either yet (only /api/auth/*), so both are mocked at the target v1 contract
 * (docs/mocking.md). Interface language is a per-user client preference handled
 * by i18n (not part of this contract); currency is a static read-only UZS section.
 */

/** Organization profile — all fields editable in the Организация section. */
export type Organization = {
	name: string;
	address: string;
	phone: string;
	email: string;
	/** Logo as a data URL (mock); null when none set. */
	logoUrl: string | null;
};

export type ContactType = "email" | "phone";

/**
 * A tenant user. Users are NEVER deleted (rule 41) — audit history references
 * them; they are deactivated / reactivated instead. Roles are not split in MVP —
 * everyone is «Администратор» (cosmetic).
 */
export type TenantUser = {
	id: number;
	name: string;
	/** Email address or phone number. */
	contact: string;
	contactType: ContactType;
	active: boolean;
	/** True for the signed-in user — cannot deactivate own account. */
	self: boolean;
	/** Served online flag (active users only). */
	online: boolean;
	/** ISO timestamp of last activity (deactivation date when inactive); null if never. */
	lastActiveAt: string | null;
};

/** Invite by email or phone. */
export type InviteUserRequest = {
	method: ContactType;
	value: string;
};
