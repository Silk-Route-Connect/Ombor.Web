import { TFunction } from "i18next";
import { PayrollFormValues } from "schemas/PayrollSchema";

/** «YYYY-MM» from a year and a 1-based month — the only period format the backend stores. */
export const toPeriod = (year: number, month: number): string =>
	`${year}-${String(month).padStart(2, "0")}`;

/** Current month as the backend period token «YYYY-MM» (e.g. "2026-06"). */
export const currentPeriod = (): string => {
	const d = new Date();
	return toPeriod(d.getFullYear(), d.getMonth() + 1);
};

/** Year and 1-based month of a «YYYY-MM» period; anything else reads as the current month. */
export const parsePeriod = (value: string): { year: number; month: number } => {
	const match = /^(\d{4})-(\d{2})$/.exec(value);
	if (!match) {
		const now = new Date();
		return { year: now.getFullYear(), month: now.getMonth() + 1 };
	}
	return { year: Number(match[1]), month: Number(match[2]) };
};

/** Year choices for a payroll period: the current year ±2, ascending — never a fixed list. */
export const periodYearOptions = (now: Date = new Date()): number[] => {
	const year = now.getFullYear();
	return [year - 2, year - 1, year, year + 1, year + 2];
};

/**
 * «Июль 2026» from a payroll period («YYYY-MM») or an ISO date, via the i18n
 * month names. Anything else (legacy rows saved as a label) renders as-is.
 */
export const formatPeriod = (t: TFunction, value: string): string => {
	const match = /^(\d{4})-(\d{2})/.exec(value);
	if (!match) {
		return value;
	}
	return `${t(`common.month.${Number(match[2])}`)} ${match[1]}`;
};

/** Fresh default form values — the period defaults to the current month. */
export const payrollDefaultValues = (): PayrollFormValues => ({
	employeeId: 0,
	walletId: 0,
	amount: 0,
	period: currentPeriod(),
	notes: "",
});
