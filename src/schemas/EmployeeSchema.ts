import i18next from "i18n/config";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";
import { z } from "zod";

export const EmployeeStatusSchema = z.custom<EmployeeStatus>(
	(value) => typeof value === "string" && (EMPLOYEE_STATUSES as readonly string[]).includes(value),
	{ message: i18next.t("employee.validation.statusInvalid") },
);

const phoneRegex = /^\+?\d{7,15}$/;
export const PhoneNumberSchema = z
	.string()
	.transform((v) => v.replaceAll(/\s+/g, ""))
	.refine((v) => v === "" || phoneRegex.test(v), {
		message: i18next.t("employee.validation.phoneNumberInvalid"),
	});

const emailRegex = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,63}$/;

const ContactInfoSchema = z
	.object({
		phoneNumbers: z
			.array(PhoneNumberSchema)
			.transform((arr) => arr.filter((v) => v !== ""))
			.default([]),

		email: z
			.string()
			.trim()
			.max(250, i18next.t("employee.validation.emailTooLong"))
			.refine((v) => v === "" || emailRegex.test(v), {
				message: i18next.t("employee.validation.emailInvalid"),
			})
			.optional()
			.or(z.literal("")),

		address: z
			.string()
			.trim()
			.max(250, i18next.t("employee.validation.addressTooLong"))
			.optional()
			.or(z.literal("")),

		telegramAccount: z
			.string()
			.trim()
			.max(250, i18next.t("employee.validation.telegramTooLong"))
			.optional()
			.or(z.literal("")),
	})
	.default({
		phoneNumbers: [],
		email: "",
		address: "",
		telegramAccount: "",
	});

export const EmployeeSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, i18next.t("employee.validation.nameRequired"))
		.max(250, i18next.t("employee.validation.nameTooLong")),

	position: z
		.string()
		.trim()
		.min(1, i18next.t("employee.validation.positionRequired"))
		.max(250, i18next.t("employee.validation.positionTooLong")),

	salary: z.number().min(0, i18next.t("employee.validation.salaryMin")),

	status: EmployeeStatusSchema,

	dateOfEmployment: z
		.string()
		.min(1, i18next.t("employee.validation.dateRequired"))
		.refine(
			(date) => {
				// `date` is a YYYY-MM-DD value from a native date input. `new Date("YYYY-MM-DD")`
				// parses as UTC midnight, so in any timezone ahead of UTC (e.g. UTC+5, Uzbekistan)
				// today's date reads as *later today* and wrongly fails the "not in the future"
				// check — blocking the default hire date. Parse the parts as a local date so both
				// sides compare at local midnight.
				const [y, m, d] = date.split("-").map(Number);
				const employmentDate = y && m && d ? new Date(y, m - 1, d) : new Date(date);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				return employmentDate <= today;
			},
			{
				message: i18next.t("employee.validation.dateFuture"),
			},
		),

	contactInfo: ContactInfoSchema,
});

export type EmployeeFormInputs = z.input<typeof EmployeeSchema>;
export type EmployeeFormValues = z.output<typeof EmployeeSchema>;
