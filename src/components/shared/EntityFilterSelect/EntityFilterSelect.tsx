import React from "react";
import { designTokens } from "theme";

import { Box, MenuItem, SxProps, TextField, Theme } from "@mui/material";

export interface FilterOption<T extends string = string> {
	/** MUI Select value — always a string; callers map ids/names to/from it. */
	value: T;
	label: string;
}

/** @deprecated name kept for existing imports — use `FilterOption`. */
export type EntityFilterOption = FilterOption;

export interface EntityFilterSelectProps<T extends string = string> {
	value: T;
	/** The choices. Without `allValue`, the first option is the unfiltered default. */
	options: FilterOption<T>[];
	onChange: (value: T) => void;
	/** «Все …» first option (the unfiltered state) for entity lists (warehouses, categories). */
	allValue?: T;
	allLabel?: string;
	/** Short name shown before the value («Тип: Продажи») where the value alone is ambiguous. */
	label?: string;
	/** Leading glyph (e.g. a warehouse/category icon); styled by the component. */
	icon?: React.ReactNode;
	/** Shown in the closed control instead of the option label (a picked custom period). */
	valueLabel?: string;
	/** Picking the already-selected option again (a select fires no change for it). */
	onReselect?: (value: T) => void;
	width?: number;
	sx?: SxProps<Theme>;
}

/**
 * The one table filter dropdown (XC-1, tables-19) — list filter rows and
 * detail-tab bands alike: an icon-led `Select` at the standard control height
 * (theme `controlSize.md`, 38px). A filter that is on (value ≠ the default)
 * reads with the teal tint so a narrowed table is never mistaken for the whole.
 */
export function EntityFilterSelect<T extends string = string>({
	value,
	options,
	onChange,
	allValue,
	allLabel,
	label,
	icon,
	valueLabel,
	onReselect,
	width,
	sx,
}: Readonly<EntityFilterSelectProps<T>>) {
	const choices: FilterOption<T>[] =
		allValue !== undefined ? [{ value: allValue, label: allLabel ?? "" }, ...options] : options;
	const isActive = value !== choices[0]?.value;

	const renderValue = (selected: unknown) => {
		const current = valueLabel ?? choices.find((o) => o.value === selected)?.label ?? "";
		return label ? `${label}: ${current}` : current;
	};

	return (
		<TextField
			select
			size="small"
			value={value}
			onChange={(e) => onChange(e.target.value as T)}
			sx={{
				width,
				minWidth: width ? undefined : 150,
				"& .MuiOutlinedInput-root": {
					bgcolor: isActive ? designTokens.primarySoft : "background.paper",
					color: isActive ? "primary.main" : "text.primary",
					fontWeight: isActive ? 600 : 400,
				},
				...sx,
			}}
			slotProps={{
				select: { renderValue },
				input: icon
					? {
							startAdornment: (
								<Box
									component="span"
									sx={{
										display: "inline-flex",
										color: isActive ? "primary.main" : "text.disabled",
										mr: "6px",
										"& svg": { fontSize: 16 },
									}}
								>
									{icon}
								</Box>
							),
						}
					: undefined,
			}}
		>
			{choices.map((option) => (
				<MenuItem
					key={option.value}
					value={option.value}
					onClick={onReselect && option.value === value ? () => onReselect(value) : undefined}
				>
					{option.label}
				</MenuItem>
			))}
		</TextField>
	);
}

export default EntityFilterSelect;
