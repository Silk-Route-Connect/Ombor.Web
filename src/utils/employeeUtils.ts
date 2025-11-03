import { ContactInfo, Employee } from "models/employee";
import { EmployeeFormInputs, EmployeeFormValues } from "schemas/EmployeeSchema";

export const EMPLOYEE_FORM_DEFAULT_VALUES: EmployeeFormValues = {
	fullName: "",
	position: "",
	salary: 0,
	status: "Active",
	dateOfEmployment: new Date().toISOString().split("T")[0],
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

	const hasPhoneNumbers = contactInfo.phoneNumbers && contactInfo.phoneNumbers.length > 0;
	const hasEmail = contactInfo.email && contactInfo.email.trim() !== "";
	const hasAddress = contactInfo.address && contactInfo.address.trim() !== "";
	const hasTelegram = contactInfo.telegramAccount && contactInfo.telegramAccount.trim() !== "";

	if (!hasPhoneNumbers && !hasEmail && !hasAddress && !hasTelegram) {
		return { ...rest, salary: numericSalary, contactInfo: undefined };
	}

	return {
		...rest,
		salary: numericSalary,
		contactInfo: {
			phoneNumbers: contactInfo.phoneNumbers || [],
			email: hasEmail ? contactInfo.email : undefined,
			address: hasAddress ? contactInfo.address : undefined,
			telegramAccount: hasTelegram ? contactInfo.telegramAccount : undefined,
		},
	};
};
