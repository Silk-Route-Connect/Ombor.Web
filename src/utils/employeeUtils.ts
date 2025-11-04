import { ContactInfo, Employee } from "models/employee";
import { EmployeeFormInputs, EmployeeFormValues } from "schemas/EmployeeSchema";

const today = new Date();
const localISODate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
	.toISOString()
	.split("T")[0];

export const EMPLOYEE_FORM_DEFAULT_VALUES: EmployeeFormValues = {
	fullName: "",
	position: "",
	salary: 0,
	status: "Active",
	dateOfEmployment: localISODate,
	contactInfo: {
		phoneNumbers: [""],
		email: "",
		address: "",
		telegramAccount: "",
	},
};

export const mapEmployeeToFormValues = (employee: Employee): EmployeeFormValues => {
	const phoneNumbers =
		employee.contactInfo?.phoneNumbers && employee.contactInfo.phoneNumbers.length > 0
			? employee.contactInfo.phoneNumbers
			: [""];

	return {
		fullName: employee.fullName,
		position: employee.position,
		salary: employee.salary,
		status: employee.status,
		dateOfEmployment: employee.dateOfEmployment,
		contactInfo: {
			phoneNumbers,
			email: employee.contactInfo?.email || "",
			address: employee.contactInfo?.address || "",
			telegramAccount: employee.contactInfo?.telegramAccount || "",
		},
	};
};

export const cleanContactInfo = (
	payload: EmployeeFormInputs,
): Omit<EmployeeFormValues, "contactInfo"> & { contactInfo?: ContactInfo } => {
	const { contactInfo, salary, ...rest } = payload;
	const numericSalary = typeof salary === "string" ? Number.parseFloat(salary) : salary;

	if (!contactInfo) {
		return { ...rest, salary: numericSalary, contactInfo: undefined };
	}

	const phoneNumbers = (contactInfo.phoneNumbers ?? [])
		.map((value) => value?.trim() ?? "")
		.filter((value) => value !== "");
	const email = contactInfo.email?.trim() ?? "";
	const address = contactInfo.address?.trim() ?? "";
	const telegramAccount = contactInfo.telegramAccount?.trim() ?? "";

	const hasPhoneNumbers = phoneNumbers.length > 0;
	const hasEmail = email !== "";
	const hasAddress = address !== "";
	const hasTelegram = telegramAccount !== "";

	if (!hasPhoneNumbers && !hasEmail && !hasAddress && !hasTelegram) {
		return { ...rest, salary: numericSalary, contactInfo: undefined };
	}

	return {
		...rest,
		salary: numericSalary,
		contactInfo: {
			phoneNumbers,
			email: hasEmail ? email : undefined,
			address: hasAddress ? address : undefined,
			telegramAccount: hasTelegram ? telegramAccount : undefined,
		},
	};
};
