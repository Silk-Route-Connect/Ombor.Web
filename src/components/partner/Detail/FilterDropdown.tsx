import React, { useState } from "react";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, ButtonBase, ListItemText, Menu, MenuItem, Typography } from "@mui/material";

export type FilterOption<T extends string> = { value: T; label: string };

interface FilterDropdownProps<T extends string> {
	label: string;
	icon?: React.ReactNode;
	value: T;
	options: FilterOption<T>[];
	onChange: (value: T) => void;
	/** Drop the leading icon + «Label:» prefix, showing just the value + chevron —
	 *  space-saving for tight toolbars (e.g. the narrower two-column detail column). */
	compact?: boolean;
}

/**
 * Toolbar filter dropdown per the bundle's `.sdrop-trig` / `.filt-menu`:
 * «Label: value ▾», with a check on the active option. Highlights when the
 * value differs from the default (first option).
 */
export function FilterDropdown<T extends string>({
	label,
	icon,
	value,
	options,
	onChange,
	compact = false,
}: Readonly<FilterDropdownProps<T>>) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const current = options.find((o) => o.value === value);
	const isDefault = value === options[0]?.value;

	return (
		<>
			<ButtonBase
				onClick={(e) => setAnchor(e.currentTarget)}
				sx={{
					display: "inline-flex",
					alignItems: "center",
					gap: "7px",
					height: 40,
					px: "13px",
					borderRadius: "8px",
					border: "1px solid",
					borderColor: isDefault ? designTokens.gray300 : designTokens.primaryLine,
					bgcolor: isDefault ? "background.paper" : designTokens.primarySoft,
					color: isDefault ? designTokens.gray700 : "primary.main",
					fontSize: 13.5,
					fontFamily: "inherit",
					whiteSpace: "nowrap",
				}}
			>
				{!compact && icon}
				{!compact && (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{label}:
					</Box>
				)}
				<Box component="span" sx={{ fontWeight: 600 }}>
					{current?.label ?? "—"}
				</Box>
				<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
			</ButtonBase>

			<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
				{options.map((option) => {
					const selected = option.value === value;
					return (
						<MenuItem
							key={option.value}
							selected={selected}
							onClick={() => {
								onChange(option.value);
								setAnchor(null);
							}}
							sx={{ minWidth: 200, gap: "10px" }}
						>
							<ListItemText
								primary={
									<Typography
										sx={{
											fontSize: 13.5,
											fontWeight: selected ? 600 : 400,
											color: selected ? "primary.main" : "text.primary",
										}}
									>
										{option.label}
									</Typography>
								}
							/>
							{selected && <CheckIcon sx={{ fontSize: 16, color: "primary.main" }} />}
						</MenuItem>
					);
				})}
			</Menu>
		</>
	);
}

export default FilterDropdown;
