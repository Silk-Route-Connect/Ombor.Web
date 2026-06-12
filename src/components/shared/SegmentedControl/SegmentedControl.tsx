import React from "react";
import { designTokens } from "theme";

import { Box, ButtonBase } from "@mui/material";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
}

export interface SegmentedControlProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Stretch across the container with equal-width items (bundle `.seg-full`). */
	fullWidth?: boolean;
	disabled?: boolean;
}

/**
 * Segmented control per the design system's `.seg`/`.seg-i`: gray track
 * (--gray-100, r-md, 3px inner padding, 2px gap); the selected item is a
 * white card (surface bg, e-1 shadow, r-sm) inside the track.
 */
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	fullWidth = false,
	disabled = false,
}: Readonly<SegmentedControlProps<T>>) {
	return (
		<Box
			sx={{
				display: fullWidth ? "flex" : "inline-flex",
				width: fullWidth ? "100%" : "auto",
				bgcolor: designTokens.gray100,
				borderRadius: "8px",
				p: "3px",
				gap: "2px",
			}}
		>
			{options.map((option) => {
				const selected = option.value === value;
				return (
					<ButtonBase
						key={option.value}
						onClick={() => onChange(option.value)}
						disabled={disabled}
						sx={{
							flex: fullWidth ? 1 : "0 0 auto",
							justifyContent: "center",
							px: "13px",
							py: "6px",
							fontSize: 13,
							fontWeight: selected ? 600 : 500,
							fontFamily: "inherit",
							color: selected ? "text.primary" : "text.secondary",
							borderRadius: "6px",
							bgcolor: selected ? "background.paper" : "transparent",
							boxShadow: selected ? 1 : "none",
						}}
					>
						{option.label}
					</ButtonBase>
				);
			})}
		</Box>
	);
}

export default SegmentedControl;
