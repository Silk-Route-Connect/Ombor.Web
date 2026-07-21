/**
 * Payroll create request (POST /api/employees/{id}/payrolls) — the redesigned
 * backend contract. A payroll payment is UZS-only, drawn from a wallet (rule 9):
 * no currency / exchange-rate / method. It carries the period it pays for and is
 * **immutable** (rule 1) — there is no update/delete. The create + history
 * responses are the redesigned `PaymentRecord` (models/payment.ts).
 */
export type CreatePayrollRequest = {
	employeeId: number;
	/** Wallet the salary is paid from (rule 9). */
	walletId: number;
	amount: number;
	/** Period the payroll pays for, as the backend token «YYYY-MM» (e.g. "2026-06"). */
	period: string;
	notes?: string;
};

export type GetPayrollHistoryRequest = {
	employeeId: number;
};
