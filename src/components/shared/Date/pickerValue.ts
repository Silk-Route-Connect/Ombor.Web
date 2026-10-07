import { format, isValid, parse } from "date-fns";

/**
 * The span the pickers treat as a real date (MUI's default `minDate` / `maxDate`).
 * A year typed digit by digit passes through 0002, 0020 and 0202 before 2026;
 * those intermediate days stay inside the field instead of reaching the form.
 */
const EARLIEST = new Date(1900, 0, 1);
const LATEST = new Date(2099, 11, 31, 23, 59, 59);

/**
 * A form's string («yyyy-MM-dd», «HH:mm») as the picker's `Date`, in local time —
 * never through `toISOString`, so the day cannot shift by the UTC offset. A
 * malformed string becomes an Invalid Date (an empty field), not another day.
 */
export const toPickerDate = (value: string, valueFormat: string): Date | null =>
	value === "" ? null : parse(value, valueFormat, new Date());

/**
 * The picker's `Date` back as the form's string; "" while the entry is empty,
 * incomplete (sections left blank), not a real day (31.02) or outside the pickers'
 * span — so required-field checks see «nothing entered» rather than another date.
 */
export function fromPickerDate(date: Date | null, valueFormat: string): string {
	if (date === null || !isValid(date) || date < EARLIEST || date > LATEST) {
		return "";
	}
	return format(date, valueFormat);
}
