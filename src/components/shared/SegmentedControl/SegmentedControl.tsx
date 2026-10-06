import React from "react";
import { controlSize, designTokens, radius } from "theme";

import type { Theme } from "@mui/material";
import { Box, ButtonBase } from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

export interface SegmentedOption<T extends string> {
	value: T;
	label: string;
	/** A 16px glyph before the label (wallet type, template type…). */
	icon?: React.ReactNode;
}

/**
 * `filter` — the list/toolbar look: grey track, the selected item a white card.
 * `form` — a one-of-N choice inside a form: a white control outlined like a
 * field, the selected item a teal-tinted segment, so it reads as an input in a
 * white modal instead of a disabled grey block.
 */
export type SegmentedVariant = "filter" | "form";

export interface SegmentedControlProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
	/** Stretch across the container with equal-width items (bundle `.seg-full`). */
	fullWidth?: boolean;
	disabled?: boolean;
	variant?: SegmentedVariant;
}

const TRACK_SX: Record<SegmentedVariant, SystemStyleObject<Theme>> = {
	filter: {
		bgcolor: designTokens.gray100,
		// The track is the only filter control without an outline; a hairline
		// keeps it readable on the canvas, a card and a modal alike.
		boxShadow: `inset 0 0 0 1px ${designTokens.border}`,
	},
	form: {
		bgcolor: "background.paper",
		// The field edge (3.7:1), like every other control in the form.
		boxShadow: `inset 0 0 0 1px ${designTokens.borderControl}`,
	},
};

const itemSx = (variant: SegmentedVariant, selected: boolean): SystemStyleObject<Theme> =>
	variant === "form"
		? {
				fontWeight: selected ? 600 : 500,
				whiteSpace: "nowrap",
				color: selected ? "primary.dark" : "text.secondary",
				bgcolor: selected ? designTokens.primarySoft : "transparent",
				boxShadow: selected ? `inset 0 0 0 1px ${designTokens.primaryLine}` : "none",
				"&:hover": selected ? undefined : { bgcolor: designTokens.bgSubtle, color: "text.primary" },
			}
		: {
				fontWeight: selected ? 600 : 500,
				color: selected ? "text.primary" : "text.secondary",
				bgcolor: selected ? "background.paper" : "transparent",
				boxShadow: selected ? 1 : "none",
			};

/**
 * Segmented control per the design system's `.seg`/`.seg-i`: a 38px track
 * (r-md, 3px inner padding, 2px gap) of equal-height items; see
 * {@link SegmentedVariant} for the two looks.
 */
export function SegmentedControl<T extends string>({
	options,
	value,
	onChange,
	fullWidth = false,
	disabled = false,
	variant = "filter",
}: Readonly<SegmentedControlProps<T>>) {
	return (
		<Box
			role={variant === "form" ? "group" : undefined}
			// The FormFieldLabel above names the group (labelLink).
			data-labelled-control={variant === "form" ? "" : undefined}
			sx={[
				{
					// md control height (theme controlSize) so it aligns with the sibling
					// header/filter controls (search / dropdown / buttons); the items
					// stretch to fill the track so the selected card is full-height.
					display: fullWidth ? "flex" : "inline-flex",
					alignItems: "stretch",
					height: controlSize.md.height,
					width: fullWidth ? "100%" : "auto",
					borderRadius: `${radius.md}px`,
					p: "3px",
					gap: "2px",
				},
				TRACK_SX[variant],
			]}
		>
			{options.map((option) => {
				const selected = option.value === value;
				return (
					<ButtonBase
						key={option.value}
						onClick={() => onChange(option.value)}
						disabled={disabled}
						aria-pressed={selected}
						sx={[
							{
								flex: fullWidth ? 1 : "0 0 auto",
								justifyContent: "center",
								gap: "7px",
								px: "13px",
								fontSize: 13,
								borderRadius: `${radius.sm}px`,
								"& .MuiSvgIcon-root": { fontSize: 16 },
							},
							itemSx(variant, selected),
						]}
					>
						{option.icon}
						{option.label}
					</ButtonBase>
				);
			})}
		</Box>
	);
}

export default SegmentedControl;
