// src/utils/dateUtils.ts
export function formatDateTime(value: Date | string): string {
	/* Convert string → Date if necessary */
	const d: Date = value instanceof Date ? value : new Date(value);

	/* Helper for zero-padding */
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
