/**
 * Client-side CSV export of the current filtered/sorted view (locked UI pattern
 * 11). The single export mechanism across list pages — pages pass the rows they
 * already display and a column map; nothing is re-fetched or re-sorted here.
 *
 * Excel-friendly by design: a UTF-8 BOM so Cyrillic opens intact, and a
 * semicolon delimiter (the list separator ru/European Excel expects) so columns
 * split correctly without an import wizard.
 */

export interface CsvColumn<T> {
	/** Localised column header (the ru string the page already renders). */
	header: string;
	/** Cell value for a row; nullish becomes an empty cell. */
	value: (row: T) => string | number | null | undefined;
}

const DELIMITER = ";";
// UTF-8 byte-order mark (U+FEFF) — makes Excel decode the file as UTF-8.
const BOM = String.fromCharCode(0xfeff);

function escapeCell(raw: string | number | null | undefined): string {
	const value = raw == null ? "" : String(raw);
	// Neutralise CSV formula injection: a leading =, +, -, @ (or tab/CR) makes
	// Excel/Sheets evaluate the cell as a formula. Prefix an apostrophe so the
	// spreadsheet treats it as literal text (OWASP CSV Injection).
	const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
	// Quote when the value contains the delimiter, a quote, or a newline.
	if (/[";\r\n]/.test(guarded)) {
		return `"${guarded.replace(/"/g, '""')}"`;
	}
	return guarded;
}

/**
 * Build a CSV from `rows` using `columns` and trigger a browser download.
 *
 * @param filename Base file name without extension (e.g. "products_2026-06-11").
 */
export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
	const headerLine = columns.map((c) => escapeCell(c.header)).join(DELIMITER);
	const bodyLines = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(DELIMITER));

	const csv = [headerLine, ...bodyLines].join("\r\n");
	const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/** `YYYY-MM-DD` suffix for export file names. */
export function csvDateStamp(date: Date = new Date()): string {
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
}
