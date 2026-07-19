import React from "react";
import { designTokens } from "theme";

import { Box, MenuItem, SxProps, TextField, Theme } from "@mui/material";

export interface EntityFilterOption {
	/** MUI Select value — always a string; callers map ids/names to/from it. */
	value: string;
	label: string;
}

export interface EntityFilterSelectProps {
	/** Current selection; use `allValue` for the «Все …» state. */
	value: string;
	/** Sentinel value for the «all» option (rendered first). */
	allValue: string;
	allLabel: string;
	options: EntityFilterOption[];
	onChange: (value: string) => void;
	/** Leading glyph (e.g. a warehouse/category icon); styled by the component. */
	icon?: React.ReactNode;
	width?: number;
	sx?: SxProps<Theme>;
}

/**
 * Compact filter dropdown (XC-1) — a small icon-led `Select` with an «Все …»
 * first option. The compact pill-dropdown style is defined **once here** and
 * reused by the table filters (warehouse, category) instead of re-inlining the
 * same ~20-line `TextField select` per module (hard rule 9). Small option sets
 * read better as a compact dropdown than a full typeahead (owner preference).
 */
const EntityFilterSelect: React.FC<EntityFilterSelectProps> = ({
	value,
	allValue,
	allLabel,
	options,
	onChange,
	icon,
	width = 200,
	sx,
}) => (
	<TextField
		select
		size="small"
		value={value}
		onChange={(e) => onChange(e.target.value)}
		sx={{
			width,
			"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
			"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
			...sx,
		}}
		slotProps={
			icon
				? {
						input: {
							startAdornment: (
								<Box
									component="span"
									sx={{
										display: "inline-flex",
										color: "text.disabled",
										mr: "6px",
										"& svg": { fontSize: 16 },
									}}
								>
									{icon}
								</Box>
							),
						},
					}
				: undefined
		}
	>
		<MenuItem value={allValue}>{allLabel}</MenuItem>
		{options.map((option) => (
			<MenuItem key={option.value} value={option.value}>
				{option.label}
			</MenuItem>
		))}
	</TextField>
);

export default EntityFilterSelect;
