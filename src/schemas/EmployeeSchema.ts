import { translate } from "i18n/i18n";
import { EMPLOYEE_STATUSES, EmployeeStatus } from "models/employee";
import { z } from "zod";

export const EmployeeStatusSchema = z.custom<EmployeeStatus>(
	(value) => typeof value === "string" && (EMPLOYEE_STATUSES as readonly string[]).includes(value),
	{ message: translate("employee.validation.statusInvalid") },
);

const phoneRegex = /^\+?\d{7,15}$/;
export const PhoneNumberSchema = z
	.string()
	.transform((v) => v.replace(/\s+/g, ""))
	.refine((v) => v === "" || phoneRegex.test(v), {
		message: translate("employee.validation.phoneNumberInvalid"),
	});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactInfoSchema = z
	.object({
		phoneNumbers: z
			.array(PhoneNumberSchema)
			.transform((arr) => arr.filter((v) => v !== ""))
			.default([]),

		email: z
			.string()
			.trim()
			.max(250, translate("employee.validation.emailTooLong"))
			.refine((v) => v === "" || emailRegex.test(v), {
				message: translate("employee.validation.emailInvalid"),
			})
			.optional()
			.or(z.literal("")),

		address: z
			.string()
			.trim()
			.max(250, translate("employee.validation.addressTooLong"))
			.optional()
			.or(z.literal("")),

		telegramAccount: z
			.string()
			.trim()
			.max(250, translate("employee.validation.telegramTooLong"))
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
	fullName: z
		.string()
		.trim()
		.min(1, translate("employee.validation.fullNameRequired"))
		.max(250, translate("employee.validation.fullNameTooLong")),

	position: z
		.string()
		.trim()
		.min(1, translate("employee.validation.positionRequired"))
		.max(250, translate("employee.validation.positionTooLong")),

	salary: z.number().min(0, translate("employee.validation.salaryMin")),

	status: EmployeeStatusSchema,

	dateOfEmployment: z
		.string()
		.min(1, translate("employee.validation.dateRequired"))
		.refine(
			(date) => {
				const employmentDate = new Date(date);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				return employmentDate <= today;
			},
			{
				message: translate("employee.validation.dateFuture"),
			},
		),

	contactInfo: ContactInfoSchema,
});

export type EmployeeFormInputs = z.input<typeof EmployeeSchema>;
export type EmployeeFormValues = z.output<typeof EmployeeSchema>;
