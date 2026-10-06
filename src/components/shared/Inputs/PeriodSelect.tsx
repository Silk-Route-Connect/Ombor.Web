import React from "react";
import { useTranslation } from "react-i18next";
import { periodYearOptions } from "utils/payrollUtils";

import { Box, MenuItem, TextField } from "@mui/material";

const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

export interface PeriodSelectProps {
	/** 1-based month. */
	month: number;
	year: number;
	onChange: (period: { month: number; year: number }) => void;
	/** Floating label of the month field; omit when a `FormFieldLabel` sits above. */
	label?: string;
	size?: "small" | "medium";
	error?: boolean;
	helperText?: string;
	disabled?: boolean;
}

/**
 * Month + year picker for a «YYYY-MM» period. Two selects with the app's own
 * month names — a native `type="month"` input renders in the browser's locale
 * («October 2026»), not the UI language.
 */
const PeriodSelect: React.FC<PeriodSelectProps> = ({
	month,
	year,
	onChange,
	label,
	size = "medium",
	error,
	helperText,
	disabled,
}) => {
	const { t } = useTranslation();
	const years = periodYearOptions();
	// A saved period outside the ±2-year window still shows its own year.
	const yearOptions = years.includes(year) ? years : [...years, year].sort((a, b) => a - b);

	return (
		<Box sx={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
			<TextField
				select
				fullWidth
				size={size}
				label={label}
				value={month}
				onChange={(e) => onChange({ month: Number(e.target.value), year })}
				error={error}
				helperText={helperText}
				disabled={disabled}
				slotProps={{
					select: { SelectDisplayProps: { "aria-label": t("common.period.month") } },
				}}
			>
				{MONTH_NUMBERS.map((n) => (
					<MenuItem key={n} value={n}>
						{t(`common.month.${n}`)}
					</MenuItem>
				))}
			</TextField>
			<TextField
				select
				size={size}
				label={label ? t("common.period.year") : undefined}
				value={year}
				onChange={(e) => onChange({ month, year: Number(e.target.value) })}
				error={error}
				disabled={disabled}
				sx={{ width: 120, flexShrink: 0 }}
				slotProps={{
					select: { SelectDisplayProps: { "aria-label": t("common.period.year") } },
				}}
			>
				{yearOptions.map((y) => (
					<MenuItem key={y} value={y}>
						{y}
					</MenuItem>
				))}
			</TextField>
		</Box>
	);
};

export default PeriodSelect;
