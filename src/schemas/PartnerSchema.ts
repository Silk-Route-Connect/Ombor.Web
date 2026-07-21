import i18next from "i18n/config";
import { PartnerType } from "models/partner";
import { PARTNER_TYPES } from "utils/partnerUtils";
import { uzPhoneToStored } from "utils/phoneUtils";
import { z } from "zod";

export const MAX_PHONES_COUNT = 5;

export const PartnerTypeSchema = z.custom<PartnerType>(
	(v) => typeof v === "string" && (PARTNER_TYPES as readonly string[]).includes(v),
	{ message: i18next.t("partner.validation.invalidType") },
);

const phoneRegex = /^\+?\d{7,15}$/;
const PhoneNumberSchema = z
	.string()
	// Canonicalise every row to +998XXXXXXXXX (idempotent) so untouched
	// edit-prefilled rows are normalised too, not just keystroke-driven ones.
	.transform((v) => uzPhoneToStored(v))
	.refine((v) => v === "" || phoneRegex.test(v), {
		message: i18next.t("partner.validation.phoneNumbersInvalid"),
	});

const optionalTrimmed = (max: number, key: string) =>
	z
		.string()
		.trim()
		.max(max, i18next.t(key))
		.transform((v) => (v === "" ? undefined : v))
		.optional();

const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;

// Telegram handle: optional leading @, must start with a letter, then
// letters/digits/underscore, 5–32 chars total (Telegram's own rule).
const telegramRegex = /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/;

export const PartnerSchema = z.object({
	type: PartnerTypeSchema,

	name: z
		.string()
		.trim()
		.min(2, i18next.t("partner.validation.nameRequired"))
		.max(100, i18next.t("partner.validation.nameTooLong")),

	companyName: optionalTrimmed(100, "partner.validation.companyNameTooLong"),

	address: optionalTrimmed(200, "partner.validation.addressTooLong"),

	telegram: z
		.string()
		.trim()
		.max(100, i18next.t("partner.validation.telegramTooLong"))
		.refine((v) => v === "" || telegramRegex.test(v), {
			message: i18next.t("partner.validation.telegramInvalid"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),

	email: z
		.string()
		.trim()
		.refine((v) => v === "" || emailRegex.test(v), {
			message: i18next.t("partner.validation.invalidEmail"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),

	// At least one valid phone is required (prototype: «Укажите хотя бы один номер»).
	phoneNumbers: z
		.array(PhoneNumberSchema)
		.max(MAX_PHONES_COUNT, i18next.t("partner.validation.phoneNumbersMaxLimit"))
		.transform((arr) => arr.filter((v) => v !== ""))
		.refine((arr) => arr.length >= 1, {
			message: i18next.t("partner.validation.phoneRequired"),
		}),

	// Opening balance is captured at creation only (locked on edit).
	openingType: z.enum(["receivable", "payable"]),

	openingAmount: z
		.number({ message: i18next.t("partner.validation.openingAmountInvalid") })
		.min(0, i18next.t("partner.validation.openingAmountInvalid"))
		.max(1_000_000_000, i18next.t("partner.validation.maxBalance")),
});

export type PartnerFormInputs = z.input<typeof PartnerSchema>;
export type PartnerFormValues = z.output<typeof PartnerSchema>;

/** Compute the signed opening balance from the form's type + amount. */
export const signedOpeningBalance = (values: PartnerFormValues): number =>
	values.openingType === "payable" ? -values.openingAmount : values.openingAmount;
