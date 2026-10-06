import i18next from "i18n/config";
import { PHONE_DIGITS, TEXT_MAX } from "utils/authValidation";
import { uzNationalPart } from "utils/phoneUtils";
import { z } from "zod";

/** `InviteUserRequest`: a name so the users list reads as people, the 9 national phone digits. */
export const InviteUserSchema = z.object({
	firstName: z
		.string()
		.trim()
		.min(1, i18next.t("settings.invite.errorFirstName"))
		.max(TEXT_MAX, i18next.t("auth.errors.tooLong")),
	lastName: z.string().trim().max(TEXT_MAX, i18next.t("auth.errors.tooLong")),
	phone: z.string().refine((v) => uzNationalPart(v).length === PHONE_DIGITS, {
		message: i18next.t("settings.invite.errorPhone"),
	}),
});

export type InviteUserFormInputs = z.input<typeof InviteUserSchema>;
export type InviteUserFormValues = z.output<typeof InviteUserSchema>;
