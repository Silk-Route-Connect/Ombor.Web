import React from "react";
import { TIME_FORMAT } from "utils/dateUtils";

import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import { PickerFieldProps, usePickerField } from "./usePickerField";

/**
 * The one time-of-day input: 24-hour «ЧЧ:ММ» typed by sections («1430» reads
 * 14:30) or picked from hour / minute columns, whatever the browser's locale.
 * Carries the time as «HH:mm» like the native input it replaces.
 */
export const TimeField: React.FC<PickerFieldProps> = (props) => {
	const field = usePickerField(props, TIME_FORMAT, ScheduleOutlinedIcon);
	return <TimePicker {...field} format={TIME_FORMAT} ampm={false} />;
};

export default TimeField;
