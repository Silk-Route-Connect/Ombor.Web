import { ContactInfo, Employee, EmployeeStatus } from "models/employee";
import { EmployeeFormInputs, EmployeeFormValues } from "schemas/EmployeeSchema";

const today = new Date();
const localISODate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
	.toISOString()
	.split("T")[0];

export const EMPLOYEE_FORM_DEFAULT_VALUES: EmployeeFormValues = {
	name: "",
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
		name: employee.name,
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

export const getEmployeeStatusColor = (
	status: EmployeeStatus,
): "success" | "error" | "warning" | "default" => {
	switch (status) {
		case "Active":
			return "success";
		case "Terminated":
			return "error";
		case "OnVacation":
			return "warning";
		default:
			return "default";
	}
};

// Russian plural form selection: forms = [one, few, many].
const ruPlural = (n: number, forms: [string, string, string]): string => {
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return forms[0];
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
	return forms[2];
};

/** Employment tenure since a date, e.g. "2 года 4 месяца" (RU). */
export const formatTenure = (dateOfEmployment: string): string => {
	const start = new Date(dateOfEmployment);
	const now = new Date();
	let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
	if (now.getDate() < start.getDate()) months -= 1;
	if (months < 0) months = 0;

	const years = Math.floor(months / 12);
	const remMonths = months % 12;
	const parts: string[] = [];
	if (years > 0) parts.push(`${years} ${ruPlural(years, ["год", "года", "лет"])}`);
	if (remMonths > 0)
		parts.push(`${remMonths} ${ruPlural(remMonths, ["месяц", "месяца", "месяцев"])}`);
	return parts.length > 0 ? parts.join(" ") : "меньше месяца";
};

/** Capitalized month + year for a date, e.g. "Май 2026" (RU). */
export const formatMonthYear = (date: string): string => {
	const label = new Date(date).toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
	return label.charAt(0).toUpperCase() + label.slice(1);
};
