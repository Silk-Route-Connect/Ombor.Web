import { translate } from "i18n/i18n";
import { PartnerType } from "models/partner";
import { PARTNER_TYPES } from "utils/partnerUtils";
import { z } from "zod";

export const MAX_PHONES_COUNT = 5;

export const PartnerTypeSchema = z.custom<PartnerType>(
	(v) => typeof v === "string" && (PARTNER_TYPES as readonly string[]).includes(v),
	{ message: translate("partner.validation.invalidType") },
);

const phoneRegex = /^\+?\d{7,15}$/;
export const PhoneNumberSchema = z
	.string()
	.transform((v) => v.replace(/\s+/g, ""))
	.refine((v) => v === "" || phoneRegex.test(v), {
		message: translate("partner.validation.invalidPhone"),
	});

const stringOrUndefinedTrimmed = (max: number, key: string) =>
	z
		.string()
		.trim()
		.max(max, translate(key))
		.transform((v) => (v === "" ? undefined : v))
		.optional();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PartnerSchema = z.object({
	type: PartnerTypeSchema,

	name: z
		.string()
		.trim()
		.min(2, translate("partner.validation.nameRequired"))
		.max(100, translate("partner.validation.nameTooLong")),

	companyName: stringOrUndefinedTrimmed(100, "partner.validation.companyNameTooLong"),

	address: stringOrUndefinedTrimmed(200, "partner.validation.addressTooLong"),

	telegram: stringOrUndefinedTrimmed(200, "partner.validation.telegramTooLong"),

	email: z
		.string()
		.trim()
		.refine((v) => v === "" || emailRegex.test(v), {
			message: translate("partner.validation.invalidEmail"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),

	phoneNumbers: z
		.array(PhoneNumberSchema)
		.max(MAX_PHONES_COUNT, translate("partner.phoneNumbers.maxLimit"))
		.transform((arr) => arr.filter((v) => v !== ""))
		.optional()
		.default([]),

	isActive: z.boolean(),

	balance: z
		.number()
		.min(-1_000_000_000, translate("partner.validation.minBalance"))
		.max(1_000_000_000, translate("partner.validation.maxBalance")),
});

export type PartnerFormInputs = z.input<typeof PartnerSchema>;
export type PartnerFormValues = z.output<typeof PartnerSchema>;
