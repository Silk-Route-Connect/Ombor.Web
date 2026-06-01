import { Employee } from "models/employee";

export interface EmployeesSummary {
	total: number;
	active: number;
	onVacation: number;
	terminated: number;
	/**
	 * Sum of salaries of ACTIVE employees. `salary` has no currency in the
	 * model — treated as UZS by assumption (see redesign spec). Isolated here
	 * so it is easy to change when the backend clarifies currency.
	 */
	salaryFund: number;
}

export function getEmployeesSummary(employees: Employee[]): EmployeesSummary {
	const active = employees.filter((e) => e.status === "Active");
	return {
		total: employees.length,
		active: active.length,
		onVacation: employees.filter((e) => e.status === "OnVacation").length,
		terminated: employees.filter((e) => e.status === "Terminated").length,
		salaryFund: active.reduce((sum, e) => sum + (e.salary ?? 0), 0),
	};
}
