import React from "react";
import { translate } from "i18n/i18n";
import { DateFilter, PresetOption } from "utils/dateUtils";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Divider, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";

type FilterValue = PresetOption | "custom";

interface Props {
	value: DateFilter;
	onChange: (filter: DateFilter) => void;
}

const presets: Array<{ key: PresetOption; labelKey: string }> = [
	{ key: "week", labelKey: "reportRangeWeek" },
	{ key: "month", labelKey: "reportRangeMonth" },
	{ key: "alltime", labelKey: "reportRangeAll" },
];

const DateFilterPicker: React.FC<Props> = ({ value, onChange }) => {
	const applyPreset = (preset: PresetOption) => {
		onChange({ type: "preset", preset });
	};

	const applyCustom = () => {
		const today = new Date();
		onChange({ type: "custom", from: today, to: today });
	};

	const handleDateInput = (side: "from" | "to", raw: string) => {
		const date = new Date(raw);
		if (value.type === "custom") {
			onChange({
				type: "custom",
				from: side === "from" ? date : value.from,
				to: side === "to" ? date : value.to,
			});
		} else {
			onChange({ type: "custom", from: date, to: date });
		}
	};

	const selected: FilterValue = value.type === "preset" ? value.preset : "custom";

	const toInputValue = (date: Date) => date.toISOString().slice(0, 10);

	return (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={selected}
				onChange={(_event: React.MouseEvent<HTMLElement>, newValue: FilterValue | null) => {
					if (!newValue) {
						return;
					}

					if (newValue === "custom") {
						applyCustom();
					} else {
						applyPreset(newValue);
					}
				}}
			>
				{presets.map(({ key, labelKey }) => (
					<ToggleButton key={key} value={key}>
						{translate(labelKey)}
					</ToggleButton>
				))}

				<Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

				<ToggleButton value="custom" sx={{ pl: 1.5, pr: 1.5 }}>
					<CalendarMonthIcon fontSize="small" sx={{ mr: 0.5 }} />
					{translate("reportRangeCustom")}
				</ToggleButton>
			</ToggleButtonGroup>

			{value.type === "custom" && (
				<Box sx={{ display: "flex", gap: 2 }}>
					<TextField
						type="date"
						size="small"
						label={translate("reportFrom")}
						value={toInputValue(value.from)}
						onChange={(e) => handleDateInput("from", e.target.value)}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
					<TextField
						type="date"
						size="small"
						label={translate("reportTo")}
						value={toInputValue(value.to)}
						onChange={(e) => handleDateInput("to", e.target.value)}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
				</Box>
			)}
		</Box>
	);
};

export default DateFilterPicker;
