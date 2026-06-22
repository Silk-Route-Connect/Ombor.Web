import { PayrollFormValues } from "schemas/PayrollSchema";

/** Current month as the backend period token «YYYY-MM» (e.g. "2026-06"). */
export const currentPeriod = (): string => {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/** Fresh default form values — the period defaults to the current month. */
export const payrollDefaultValues = (): PayrollFormValues => ({
	employeeId: 0,
	walletId: 0,
	amount: 0,
	period: currentPeriod(),
	notes: "",
});
