export const EMPLOYEE_STATUSES = ["Active", "Terminated", "OnVacation"] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type ContactInfo = {
	phoneNumbers: string[];
	email?: string;
	address?: string;
	telegramAccount?: string;
};

export type Employee = {
	id: number;
	fullName: string;
	position: string;
	status: EmployeeStatus;
	salary: number;
	dateOfEmployment: string; // ISO date string from backend
	contactInfo?: ContactInfo;
};

export type GetEmployeesRequest = {
	searchTerm?: string;
};

export type GetEmployeeByIdRequest = {
	id: number;
};

export type CreateEmployeeRequest = {
	fullName: string;
	position: string;
	salary: number;
	status: EmployeeStatus;
	dateOfEmployment: string; // ISO date string (YYYY-MM-DD)
	contactInfo?: ContactInfo;
};

export type UpdateEmployeeRequest = {
	id: number;
	fullName: string;
	position: string;
	salary: number;
	status: EmployeeStatus;
	dateOfEmployment: string; // ISO date string (YYYY-MM-DD)
	contactInfo?: ContactInfo;
};
