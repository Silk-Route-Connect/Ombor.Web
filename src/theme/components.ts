import type { Components, Theme } from "@mui/material/styles";

import { BORDER_CONTROL, designTokens, INK, TEAL_500 } from "./palette";
import { controlSize, radius } from "./tokens";

/** The single keyboard-focus indicator: 2px teal outline, offset so it reads on teal fills too. */
const FOCUS_OUTLINE = { outline: `2px solid ${TEAL_500}`, outlineOffset: 2 } as const;

/** Inset variant for list-like items whose outline would overlap neighbours or be clipped. */
const FOCUS_OUTLINE_INSET = { outline: `2px solid ${TEAL_500}`, outlineOffset: -2 } as const;

export const components: Components<Omit<Theme, "components">> = {
	MuiCssBaseline: {
		styleOverrides: {
			// Clickable non-ButtonBase elements (role=button / tabIndex) get the same
			// ring; `:where` keeps specificity at zero so components can still adjust.
			":where([role='button'], [role='tab'], [role='radio'], [role='link'], a, [tabindex='0']):focus-visible":
				FOCUS_OUTLINE,
		},
	},
	MuiButtonBase: {
		styleOverrides: {
			root: { "&.Mui-focusVisible": FOCUS_OUTLINE },
		},
	},
	MuiMenuItem: {
		styleOverrides: { root: { "&.Mui-focusVisible": FOCUS_OUTLINE_INSET } },
	},
	MuiListItemButton: {
		styleOverrides: { root: { "&.Mui-focusVisible": FOCUS_OUTLINE_INSET } },
	},
	MuiTab: {
		styleOverrides: { root: { "&.Mui-focusVisible": FOCUS_OUTLINE_INSET } },
	},
	MuiButton: {
		styleOverrides: {
			root: {
				textTransform: "none",
				borderRadius: radius.md,
				fontWeight: 600,
				boxShadow: "none",
				"&:hover": { boxShadow: "none" },
				"&.Mui-focusVisible": { boxShadow: "none", ...FOCUS_OUTLINE },
			},
			// Fixed heights so header/filter rows align (see controlSize).
			sizeMedium: {
				height: controlSize.md.height,
				paddingLeft: controlSize.md.paddingX,
				paddingRight: controlSize.md.paddingX,
				fontSize: controlSize.md.fontSize,
			},
			sizeSmall: {
				height: controlSize.sm.height,
				paddingLeft: controlSize.sm.paddingX,
				paddingRight: controlSize.sm.paddingX,
				fontSize: controlSize.sm.fontSize,
			},
		},
	},
	MuiTableCell: {
		styleOverrides: {
			root: { borderColor: designTokens.border, fontSize: 14 },
		},
	},
	// Inputs / search / selects use MUI size="small"; map it to md (38px) so it
	// aligns with the default (md) buttons across a filter row.
	MuiTextField: { defaultProps: { size: "small" } },
	MuiSelect: { defaultProps: { size: "small" } },
	MuiInputBase: {
		styleOverrides: {
			input: {
				"&::placeholder": { color: designTokens.fg3, opacity: 1 },
			},
		},
	},
	MuiOutlinedInput: {
		styleOverrides: {
			root: {
				"&.MuiInputBase-sizeSmall": { minHeight: controlSize.md.height },
				"&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline":
					{ borderColor: INK },
			},
			// Field edges at 3.7:1 (WCAG 1.4.11). Card hairlines keep `border`.
			notchedOutline: { borderColor: BORDER_CONTROL },
			inputSizeSmall: {
				fontSize: controlSize.md.fontSize,
				paddingTop: controlSize.md.paddingY,
				paddingBottom: controlSize.md.paddingY,
			},
		},
	},
	MuiTooltip: {
		styleOverrides: {
			tooltip: {
				backgroundColor: INK,
				fontSize: 12,
				lineHeight: "16px",
				fontWeight: 500,
				padding: "6px 10px",
				borderRadius: radius.sm,
			},
			arrow: { color: INK },
		},
	},
	MuiDialog: {
		styleOverrides: {
			paper: { borderRadius: radius.lg },
		},
	},
	MuiBackdrop: {
		styleOverrides: {
			root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: designTokens.scrimModal } },
		},
	},
};
