export type Employee = {
	id: number;
	fullName: string;
	role: string;
	isActive: boolean;
};

export type CreateEmployeeRequest = Omit<Employee, "id">;

export type UpdateEmployeeRequest = CreateEmployeeRequest & {
	id: number;
};

export type GetEmployeesRequest = {
	searchTerm?: string;
};
