import { Payment, PaymentCurrency } from "models/payment";

export interface PayrollSummary {
	/** Current-month total per currency, e.g. { UZS: 12000000, USD: 300 }. */
	paidThisMonth: Partial<Record<PaymentCurrency, number>>;
	/** Number of payments in the current month. */
	paymentCount: number;
	/** Distinct employees paid in the current month. */
	employeeCount: number;
}

function isCurrentMonth(isoDate: string, now: Date): boolean {
	const d = new Date(isoDate);
	return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function getPayrollSummary(payments: Payment[], now: Date = new Date()): PayrollSummary {
	const thisMonth = payments.filter((p) => isCurrentMonth(p.date, now));

	const paidThisMonth: Partial<Record<PaymentCurrency, number>> = {};
	const employees = new Set<number>();

	for (const p of thisMonth) {
		const currency = p.components[0]?.currency ?? "UZS";
		paidThisMonth[currency] = (paidThisMonth[currency] ?? 0) + p.amount;
		if (p.employeeId != null) {
			employees.add(p.employeeId);
		}
	}

	return {
		paidThisMonth,
		paymentCount: thisMonth.length,
		employeeCount: employees.size,
	};
}

/** Lifetime totals grouped by each payment's primary currency. */
export function totalsByCurrency(payments: Payment[]): Partial<Record<PaymentCurrency, number>> {
	const totals: Partial<Record<PaymentCurrency, number>> = {};
	for (const p of payments) {
		const currency = p.components[0]?.currency ?? "UZS";
		totals[currency] = (totals[currency] ?? 0) + p.amount;
	}
	return totals;
}

/** Picks the currency with the largest total. Returns null when the map is empty. */
export function primaryCurrencyAmount(
	paid: Partial<Record<PaymentCurrency, number>>,
): { currency: PaymentCurrency; amount: number; others: PaymentCurrency[] } | null {
	const entries = Object.entries(paid) as [PaymentCurrency, number][];
	if (entries.length === 0) {
		return null;
	}
	entries.sort((a, b) => b[1] - a[1]);
	const [currency, amount] = entries[0];
	return { currency, amount, others: entries.slice(1).map(([c]) => c) };
}
