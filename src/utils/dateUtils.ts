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
