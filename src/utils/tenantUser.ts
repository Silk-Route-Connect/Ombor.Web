import { TenantUser } from "models/settings";

import { formatUzPhone } from "./phoneUtils";

const PHONE_LIKE = /^\+?[\d\s()-]+$/;

/** A user's contact is a phone or an e-mail; phones read «+998 90 123 45 67». */
export const displayContact = (value: string): string =>
	PHONE_LIKE.test(value) ? formatUzPhone(value) : value;

/** Invited without a name, the server shows the phone as the name. */
export const isUnnamed = (user: TenantUser): boolean =>
	user.name.trim() === "" || PHONE_LIKE.test(user.name);

/**
 * How a user is named in the list, the confirm dialogs and the toasts: their
 * name, or — for an unnamed invitee — the formatted phone, never the raw
 * «+998901234567».
 */
export const tenantUserLabel = (user: TenantUser): string =>
	isUnnamed(user) ? displayContact(user.contact) : user.name;
