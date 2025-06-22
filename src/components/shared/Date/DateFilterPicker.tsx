import React from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Box, Divider, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { translate } from "i18n/i18n";
import { DateFilter, PresetOption } from "utils/dateFilterUtils";

interface Props {
	value: DateFilter;
	onChange: (filter: DateFilter) => void;
}

const DateFilterPicker: React.FC<Props> = ({ value, onChange }) => {
	const handlePreset = (preset: PresetOption) => onChange({ type: "preset", preset });

	const toInput = (d: Date) => d.toISOString().slice(0, 10);
	const handleCustomChange = (k: "from" | "to", v: Date) => {
		if (value.type === "custom") {
			onChange({
				type: "custom",
				from: k === "from" ? v : value.from,
				to: k === "to" ? v : value.to,
			});
		} else {
			onChange({ type: "custom", from: v, to: v });
		}
	};

	return (
		<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
			<ToggleButtonGroup
				size="small"
				exclusive
				value={value.type === "preset" ? value.preset : "custom"}
				onChange={(_, v) => {
					if (!v) return;
					if (v === "custom") {
						onChange({ type: "custom", from: new Date(), to: new Date() });
					} else {
						handlePreset(v as PresetOption);
					}
				}}
			>
				<ToggleButton value="week">{translate("reportRangeWeek")}</ToggleButton>
				<ToggleButton value="month">{translate("reportRangeMonth")}</ToggleButton>
				<ToggleButton value="all">{translate("reportRangeAll")}</ToggleButton>

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
						value={toInput(value.from)}
						onChange={(e) => handleCustomChange("from", new Date(e.target.value))}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
					<TextField
						type="date"
						size="small"
						label={translate("reportTo")}
						value={toInput(value.to)}
						onChange={(e) => handleCustomChange("to", new Date(e.target.value))}
						slotProps={{ inputLabel: { shrink: true } }}
					/>
				</Box>
			)}
		</Box>
	);
};

export default DateFilterPicker;
