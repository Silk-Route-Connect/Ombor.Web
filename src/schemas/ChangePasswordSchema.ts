import i18next from "i18n/config";
import { PASSWORD_MIN, TEXT_MAX } from "utils/authValidation";
import { z } from "zod";

/** Same rules as the backend `ChangePasswordRequestValidator`. */
export const ChangePasswordSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, i18next.t("auth.errors.required"))
			.max(TEXT_MAX, i18next.t("auth.errors.passwordMax")),
		newPassword: z
			.string()
			.min(1, i18next.t("auth.errors.required"))
			.min(PASSWORD_MIN, i18next.t("auth.errors.passwordMin"))
			.max(TEXT_MAX, i18next.t("auth.errors.passwordMax")),
		confirmPassword: z.string().min(1, i18next.t("auth.errors.required")),
	})
	.refine((v) => v.confirmPassword === "" || v.confirmPassword === v.newPassword, {
		path: ["confirmPassword"],
		message: i18next.t("auth.errors.passwordMismatch"),
	});

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
