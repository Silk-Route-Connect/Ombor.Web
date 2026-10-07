import type { Components, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type {} from "@mui/x-date-pickers/themeAugmentation";

import { BORDER_CONTROL, designTokens, INK, NEUTRAL, TEAL_500 } from "./palette";
import { controlSize, iconSize, radius } from "./tokens";

/** The single keyboard-focus indicator: 2px teal outline, offset so it reads on teal fills too. */
const FOCUS_OUTLINE = { outline: `2px solid ${TEAL_500}`, outlineOffset: 2 } as const;

/** Inset variant for list-like items whose outline would overlap neighbours or be clipped. */
const FOCUS_OUTLINE_INSET = { outline: `2px solid ${TEAL_500}`, outlineOffset: -2 } as const;

const SURFACE = NEUTRAL[0];
const SCROLL_SHADOW = alpha(INK, 0.14);

/**
 * Scroll shadows on a modal body: an ink fade at whichever edge still hides
 * content. The two surface-coloured covers scroll with the content (`local`) and
 * sit over the shadows (`scroll`) once an edge is reached, so a form that fits
 * shows none — a field cut by the footer is never the only cue that more follows.
 */
const DIALOG_SCROLL_SHADOWS = [
	`linear-gradient(${SURFACE} 30%, ${alpha(SURFACE, 0)}) center top / 100% 40px no-repeat local`,
	`linear-gradient(${alpha(SURFACE, 0)}, ${SURFACE} 70%) center bottom / 100% 40px no-repeat local`,
	`radial-gradient(farthest-side at 50% 0, ${SCROLL_SHADOW}, ${alpha(INK, 0)}) center top / 100% 12px no-repeat scroll`,
	`radial-gradient(farthest-side at 50% 100%, ${SCROLL_SHADOW}, ${alpha(INK, 0)}) center bottom / 100% 12px no-repeat scroll`,
].join(", ");

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
			// A <button> does not inherit the page font; without this every bare
			// ButtonBase (tiles, segments, toggles) rendered in the UA font (Arial).
			root: { fontFamily: "inherit", "&.Mui-focusVisible": FOCUS_OUTLINE },
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
			// Start/end icons by button size. MUI's own rule (20 / 18) out-specifies an
			// icon's `sx`, which is why call sites used to force sizes with !important.
			iconSizeSmall: { "& > *:nth-of-type(1)": { fontSize: iconSize.sm } },
			iconSizeMedium: { "& > *:nth-of-type(1)": { fontSize: iconSize.md } },
			iconSizeLarge: { "& > *:nth-of-type(1)": { fontSize: iconSize.lg } },
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
	MuiSelect: {
		defaultProps: { size: "small" },
		// Dropdown arrows in the meta tone, not MUI's 54% black.
		styleOverrides: { icon: { color: designTokens.fg3, fontSize: 20 } },
	},
	// Helper / error text flush with the field edge (MUI indents it 14px), so a
	// hand-placed error and a TextField's own line start at the same x.
	MuiFormHelperText: {
		styleOverrides: {
			root: { marginLeft: 0, marginRight: 0, marginTop: 6, fontSize: 12, lineHeight: "16px" },
		},
	},
	// A unit after the value («UZS», «%») in the muted meta tone, a step smaller
	// than the figure; a leading prefix («+998») is part of the value and keeps its size.
	MuiInputAdornment: {
		styleOverrides: {
			root: ({ theme }) => ({ color: theme.palette.text.secondary }),
			positionEnd: {
				"& .MuiTypography-root": { fontSize: 13, fontWeight: 500, color: "inherit" },
			},
		},
	},
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
	// Date / time fields (shared/Date) render MUI X's own field, not a TextField:
	// the same 38px, 14px, BORDER_CONTROL edge, ink hover and placeholder tone.
	MuiPickersTextField: { defaultProps: { size: "small" } },
	MuiPickersInputBase: {
		styleOverrides: {
			root: { fontSize: controlSize.md.fontSize },
			// The «ДД.ММ.ГГГГ» format of an empty field reads as a placeholder.
			sectionsContainer: {
				variants: [
					{
						props: { isFieldValueEmpty: true, isFieldFocused: false },
						style: { color: designTokens.fg3, opacity: 1 },
					},
				],
			},
		},
	},
	MuiPickersOutlinedInput: {
		styleOverrides: {
			root: {
				minHeight: controlSize.md.height,
				"@media (hover: none)": {
					"&:hover .MuiPickersOutlinedInput-notchedOutline": { borderColor: BORDER_CONTROL },
				},
			},
			sectionsContainer: {
				paddingTop: controlSize.md.paddingY,
				paddingBottom: controlSize.md.paddingY,
			},
			notchedOutline: { borderColor: BORDER_CONTROL },
		},
	},
	// The calendar / clock popup is a menu surface (menuPaper): hairline, e-2, r-md.
	MuiPickerPopper: {
		styleOverrides: {
			paper: { borderRadius: radius.md, border: `1px solid ${designTokens.border}` },
		},
	},
	// A desktop popup has no toolbar column: the view spans the popup instead of
	// leaving the «Отмена / Ок» bar's extra width as a blank left column, and the
	// hour / minute columns sit centred in it.
	MuiPickersLayout: {
		styleOverrides: {
			contentWrapper: {
				variants: [{ props: { pickerVariant: "desktop" }, style: { gridColumn: "1 / 4" } }],
			},
		},
	},
	MuiMultiSectionDigitalClock: { styleOverrides: { root: { justifyContent: "center" } } },
	// date-fns writes Russian months in lower case («октябрь 2026»).
	MuiPickersCalendarHeader: {
		styleOverrides: { label: { textTransform: "capitalize", fontSize: 14, fontWeight: 600 } },
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
	// The modal anatomy (FormDialog): a divided, scroll-shadowed body and a
	// surface-subtle footer band. The body's bottom divider is the band's hairline.
	MuiDialogContent: {
		defaultProps: { dividers: true },
		styleOverrides: {
			root: { padding: "16px 24px 20px", background: DIALOG_SCROLL_SHADOWS },
		},
	},
	MuiDialogActions: {
		defaultProps: { disableSpacing: true },
		styleOverrides: {
			root: { padding: "14px 24px", gap: 10, backgroundColor: designTokens.bgSubtle },
		},
	},
	MuiBackdrop: {
		styleOverrides: {
			root: { "&:not(.MuiBackdrop-invisible)": { backgroundColor: designTokens.scrimModal } },
		},
	},
};
