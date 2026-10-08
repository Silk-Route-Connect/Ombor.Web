import React, { useMemo } from "react";
import { DATE_FORMAT, DAY_VALUE_FORMAT } from "utils/dateUtils";

import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { usePickerAdapter } from "@mui/x-date-pickers/hooks";

import { toPickerDate } from "./pickerValue";
import { PickerFieldProps, usePickerField } from "./usePickerField";

export interface DateFieldProps extends PickerFieldProps {
	/**
	 * The last day offered («yyyy-MM-dd»): later days are greyed out in the
	 * calendar, and a later day typed in marks the field.
	 */
	maxDate?: string;
}

/**
 * The one date input: «ДД.ММ.ГГГГ» typed section by section (digits only —
 * «07102026» reads 07.10.2026) or picked from a Russian, Monday-first calendar,
 * whatever the browser's locale. Carries the day as «yyyy-MM-dd» like the native
 * input it replaces; sits under a `FormFieldLabel`, never with a floating label.
 */
export const DateField: React.FC<DateFieldProps> = ({ maxDate, ...props }) => {
	const adapter = usePickerAdapter();
	const field = usePickerField(props, DAY_VALUE_FORMAT, CalendarTodayOutlinedIcon);
	const latest = useMemo(
		() => (maxDate ? toPickerDate(maxDate, DAY_VALUE_FORMAT) : null),
		[maxDate],
	);

	return (
		<DatePicker
			{...field}
			format={DATE_FORMAT}
			maxDate={latest ?? undefined}
			// «Пн Вт Ср…» — MUI's single letters repeat in Russian (П В С Ч П С В).
			dayOfWeekFormatter={(day) => {
				const short = adapter.format(day, "weekdayShort");
				return short.charAt(0).toUpperCase() + short.slice(1);
			}}
		/>
	);
};

export default DateField;
