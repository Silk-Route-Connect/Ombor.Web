import { DateFilter, materialise } from "./dateFilterUtils";

export function formatDateTime(value: Date | string): string {
	const d: Date = value instanceof Date ? value : new Date(value);

	const pad = (n: number) => n.toString().padStart(2, "0");

	return (
		[
			pad(d.getDate()),
			pad(d.getMonth() + 1), // JS months are 0-based
			d.getFullYear(),
		].join("-") + // dd-MM-yyyy
		" " +
		pad(d.getHours()) +
		":" +
		pad(d.getMinutes())
	); // HH:mm (24-hour)
}

export function today(): Date {
	const d = new Date();
	d.setHours(0, 0, 0, 0);
	return d;
}

export function lastNDays(n: number): Date {
	const d = today();
	d.setDate(d.getDate() - n);
	return d;
}

export function isWithinDateRange(dateIso: string | Date, filter: DateFilter): boolean {
	const { from, to } = materialise(filter);
	const date = typeof dateIso === "string" ? new Date(dateIso) : dateIso;

	from?.setHours(0, 0, 0, 0);
	to?.setHours(0, 0, 0, 0);
	date.setHours(0, 0, 0, 0);

	if (from && date < from) {
		return false;
	}

	if (to && date > to) {
		return false;
	}

	return true;
}

export function getKeyFromDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function toDate(value: Date | string) {
	return value instanceof Date ? value : new Date(value);
}
