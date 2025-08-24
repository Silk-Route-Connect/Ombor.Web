import React, { useEffect, useState } from "react";
import { Box, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { translate } from "i18n/i18n";

export type DateRangeOption = "week" | "month" | "custom";

export interface DateRangePickerProps {
	/**
	 * Called whenever the user changes the range.
	 * Provides { from, to, option } as actual Date objects + selected option.
	 */
	onChange: (range: { from: Date; to: Date; option: DateRangeOption }) => void;

	/** Initial “from” date. Defaults to one week ago. */
	initialFrom?: Date;
	/** Initial “to” date. Defaults to today. */
	initialTo?: Date;
	/** Initial selected option: "week" | "month" | "custom". Defaults to "week". */
	initialOption?: DateRangeOption;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
	onChange,
	initialFrom,
	initialTo,
	initialOption = "week",
}) => {
	const [rangeOption, setRangeOption] = useState<DateRangeOption>(initialOption);
	const [fromDate, setFromDate] = useState<Date>(
		initialFrom || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
	);
	const [toDate, setToDate] = useState<Date>(initialTo || new Date());

	// When rangeOption changes, recalc from/to if “week” or “month”; leave as-is if “custom”
	useEffect(() => {
		const now = new Date();
		if (rangeOption === "week") {
			setFromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
			setToDate(now);
		} else if (rangeOption === "month") {
			const d = new Date(now);
			d.setMonth(d.getMonth() - 1);
			setFromDate(d);
			setToDate(now);
		}
		// If custom, do not override existing fromDate/toDate
	}, [rangeOption]);

	// Notify parent whenever fromDate, toDate, or rangeOption changes
	useEffect(() => {
		onChange({ from: fromDate, to: toDate, option: rangeOption });
	}, [fromDate, toDate, rangeOption, onChange]);

	// Helper to format a Date as “YYYY-MM-DD” for the <TextField type="date">
	const toInputDate = (d: Date) => d.toISOString().slice(0, 10);

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
			<ToggleButtonGroup
				value={rangeOption}
				exclusive
				onChange={(_, v) => v && setRangeOption(v)}
				size="small"
			>
				<ToggleButton value="week">{translate("reportRangeWeek")}</ToggleButton>
				<ToggleButton value="month">{translate("reportRangeMonth")}</ToggleButton>
				<ToggleButton value="custom">{translate("reportRangeCustom")}</ToggleButton>
			</ToggleButtonGroup>

			{rangeOption === "custom" && (
				<Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
					<TextField
						label={translate("reportFrom")}
						type="date"
						size="small"
						value={toInputDate(fromDate)}
						onChange={(e) => setFromDate(new Date(e.target.value))}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
					<TextField
						label={translate("reportTo")}
						type="date"
						size="small"
						value={toInputDate(toDate)}
						onChange={(e) => setToDate(new Date(e.target.value))}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
				</Box>
			)}
		</Box>
	);
};

export default DateRangePicker;
