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
	name: string;
	position: string;
	status: EmployeeStatus;
	salary: number;
	dateOfEmployment: string;
	contactInfo?: ContactInfo;
};

export type GetEmployeesRequest = {
	searchTerm?: string;
};

export type GetEmployeeByIdRequest = {
	id: number;
};

export type CreateEmployeeRequest = {
	name: string;
	position: string;
	salary: number;
	status: EmployeeStatus;
	dateOfEmployment: string;
	contactInfo?: ContactInfo;
};

export type UpdateEmployeeRequest = {
	id: number;
	name: string;
	position: string;
	salary: number;
	status: EmployeeStatus;
	dateOfEmployment: string;
	contactInfo?: ContactInfo;
};
