import { designTokens } from "theme";

/**
 * Shared Autocomplete popper styling for the New Sale partner + product
 * dropdowns, matching the design system's `.dd-panel` / `.dd-opt`: an e-2
 * shadow, r-md corners, a hairline border, and a teal `primary-soft`
 * hover/focus on options (MUI's default is a flat grey). Keeps both dropdowns
 * consistent with the rest of the redesign.
 */
export const dropdownSlotProps = {
	paper: {
		sx: {
			mt: "6px",
			borderRadius: "8px",
			border: "1px solid",
			borderColor: "divider",
			boxShadow: 8, // theme elevation e-2
			"& .MuiAutocomplete-listbox": { py: "4px" },
			"& .MuiAutocomplete-option": {
				borderRadius: "6px",
				mx: "4px",
				"&:hover, &.Mui-focused, &.Mui-focusVisible, &[aria-selected='true']": {
					bgcolor: `${designTokens.primarySoft} !important`,
				},
			},
		},
	},
} as const;
