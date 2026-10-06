/** Optional user shape; extend when backend returns user info */
export interface AuthUser {
	id?: number;
	firstName?: string;
	lastName?: string;
	phoneNumber?: string;
	email?: string | null;
	organizationName?: string;
}

const CLAIM_NAME = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name";
const CLAIM_PHONE = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone";
const CLAIM_ID = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

/**
 * Decode a JWT payload segment as UTF-8. `atob` yields a Latin-1 (binary)
 * string, so multi-byte UTF-8 claims (e.g. Cyrillic display names) must be
 * re-decoded from the raw bytes before `JSON.parse`, otherwise the name
 * arrives as mojibake.
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
	const segment = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
	const bytes = Uint8Array.from(atob(segment), (c) => c.charCodeAt(0));
	return JSON.parse(new TextDecoder().decode(bytes));
}

/**
 * The backend exposes no /me endpoint yet — the access token's claims are
 * the only source of user identity (display name, phone, id). The tenant
 * name is not in the token; `organizationName` stays unset until the
 * backend provides it.
 */
export function userFromAccessToken(token: string): AuthUser | null {
	try {
		const payload = decodeJwtPayload(token);
		const fullName = (payload[CLAIM_NAME] as string | undefined) ?? "";
		const [firstName, ...rest] = fullName.split(" ").filter(Boolean);

		return {
			id: payload[CLAIM_ID] ? Number(payload[CLAIM_ID]) : undefined,
			firstName,
			lastName: rest.length > 0 ? rest.join(" ") : undefined,
			phoneNumber: payload[CLAIM_PHONE] as string | undefined,
		};
	} catch {
		return null;
	}
}
