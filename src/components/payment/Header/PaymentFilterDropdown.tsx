import React, { useState } from "react";
import { designTokens } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Box, ButtonBase, ListItemText, Menu, MenuItem } from "@mui/material";

export interface FilterOption<T extends string | number> {
	value: T;
	label: string;
}

interface PaymentFilterDropdownProps<T extends string | number> {
	icon: React.ReactNode;
	value: T;
	options: FilterOption<T>[];
	onChange: (value: T) => void;
}

/**
 * Compact filter pill with a dropdown (the bundle's `.sdrop-trig`): a bordered
 * trigger showing the current label, tinted primary when a non-default option
 * is active. The first option is treated as the "all" default.
 */
export function PaymentFilterDropdown<T extends string | number>({
	icon,
	value,
	options,
	onChange,
}: PaymentFilterDropdownProps<T>) {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const active = value !== options[0]?.value;
	const current = options.find((o) => o.value === value) ?? options[0];

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
					borderColor: active ? designTokens.primaryLine : designTokens.gray300,
					bgcolor: active ? designTokens.primarySoft : "background.paper",
					fontSize: 13.5,
					fontWeight: 600,
					fontFamily: "inherit",
					color: active ? "primary.main" : designTokens.gray700,
					whiteSpace: "nowrap",
				}}
			>
				<Box sx={{ display: "inline-flex", color: active ? "primary.main" : "text.disabled" }}>
					{icon}
				</Box>
				{current?.label}
				<KeyboardArrowDownIcon sx={{ fontSize: 16, opacity: 0.6 }} />
			</ButtonBase>

			<Menu
				anchorEl={anchor}
				open={Boolean(anchor)}
				onClose={() => setAnchor(null)}
				slotProps={{ paper: { sx: { minWidth: 200, mt: "4px" } } }}
			>
				{options.map((option) => {
					const selected = option.value === value;
					return (
						<MenuItem
							key={String(option.value)}
							selected={selected}
							onClick={() => {
								onChange(option.value);
								setAnchor(null);
							}}
						>
							<ListItemText primary={option.label} />
							{selected && <CheckIcon sx={{ fontSize: 16, color: "primary.main", ml: 1.5 }} />}
						</MenuItem>
					);
				})}
			</Menu>
		</>
	);
}

export default PaymentFilterDropdown;
