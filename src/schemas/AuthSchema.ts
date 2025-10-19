import { z } from "zod";

export const loginSchema = z.object({
	phoneNumber: z
		.string()
		.min(1, { message: "auth.errors.required" })
		.regex(/^(\+?998)?\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}$/, {
			message: "auth.errors.invalidPhone",
		}),
	password: z.string().min(8, { message: "auth.errors.passwordMin" }),
});

export const registerSchema = z
	.object({
		firstName: z.string().min(1, { message: "auth.errors.required" }),
		lastName: z.string().min(1, { message: "auth.errors.required" }),
		phoneNumber: z
			.string()
			.min(1, { message: "auth.errors.required" })
			.regex(/^(\+?998)?\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}$/, {
				message: "auth.errors.invalidPhone",
			}),
		organizationName: z.string().min(1, { message: "auth.errors.required" }),
		email: z
			.string()
			.email({ message: "auth.errors.invalidEmail" })
			.optional()
			.or(z.literal("").transform(() => undefined)),
		telegramAccount: z.string().optional(),
		password: z.string().min(8, { message: "auth.errors.passwordMin" }),
		confirmPassword: z.string().min(8, { message: "auth.errors.passwordMin" }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "auth.errors.passwordMismatch",
	});

export const otpSchema = z.object({
	code: z
		.string()
		.min(4, { message: "auth.errors.otpInvalid" })
		.max(4, { message: "auth.errors.otpInvalid" })
		.regex(/^\d{4}$/, { message: "auth.errors.otpInvalid" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export type RegisterFormValues = z.infer<typeof registerSchema>;

export type OtpFormValues = z.infer<typeof otpSchema>;
