import { createTheme, Shadows } from "@mui/material/styles";

import { components } from "./components";
import {
	DANGER_FG,
	designTokens,
	ERROR,
	INFO,
	INFO_FG,
	INK,
	NEUTRAL,
	SAFFRON_500,
	SAFFRON_700,
	SUCCESS,
	SUCCESS_FG,
	TEAL_500,
	TEAL_600,
	WARNING,
	WARNING_FG,
} from "./palette";
import { radius } from "./tokens";
import { typography } from "./typography";

export type { ChipToken, ChipTokenKey } from "./chipTokens";
export { chipTokens } from "./chipTokens";
export { designTokens } from "./palette";
export type { DialogSize } from "./tokens";
export { controlSize, dialogPaperSx, dialogWidth, numericSx, radius, typeScale } from "./tokens";

// Elevation (border-first, restrained).
const ELEVATION_1 = "0 1px 2px rgba(22,42,43,.05), 0 1px 3px rgba(22,42,43,.06)";
const ELEVATION_2 = "0 2px 6px rgba(22,42,43,.06), 0 6px 16px rgba(22,42,43,.06)";
const ELEVATION_3 = "0 10px 24px rgba(22,42,43,.10), 0 24px 60px rgba(22,42,43,.12)";

const shadows = [...createTheme().shadows] as Shadows;
shadows[1] = ELEVATION_1; // cards, KPI
shadows[8] = ELEVATION_2; // menus, popovers, flyouts
shadows[16] = ELEVATION_3; // slide-over, modal, floating auth card
shadows[24] = ELEVATION_3; // dialogs

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: TEAL_500,
			dark: TEAL_600,
			light: designTokens.primarySoft,
			contrastText: NEUTRAL[0],
		},
		// Saffron fills carry ink text (5.6:1); white text needs the 700 shade.
		secondary: { main: SAFFRON_500, dark: SAFFRON_700, contrastText: INK },
		// `.dark` is the on-tint text shade of each family (chips, tinted tiles).
		success: { main: SUCCESS, dark: SUCCESS_FG },
		warning: { main: WARNING, dark: WARNING_FG },
		error: { main: ERROR, dark: DANGER_FG },
		info: { main: INFO, dark: INFO_FG },
		grey: {
			50: NEUTRAL[50],
			100: NEUTRAL[100],
			200: NEUTRAL[200],
			300: NEUTRAL[300],
			400: NEUTRAL[400],
			500: NEUTRAL[500],
			600: NEUTRAL[600],
			700: NEUTRAL[700],
			800: NEUTRAL[800],
			900: NEUTRAL[900],
		},
		text: {
			primary: INK,
			secondary: designTokens.fg2,
			// Tertiary / meta text (fg-3, 4.8:1). Buttons are never disabled in this
			// app, so the slot doubles as the AA-safe meta tone; decoration has its own token.
			disabled: designTokens.fg3,
		},
		divider: designTokens.border,
		background: {
			default: designTokens.bgCanvas,
			paper: NEUTRAL[0],
		},
		action: {
			// 6% teal wash: 4% sat at the edge of perception on white rows and nav.
			hover: "rgba(18,103,107,0.06)",
			selected: designTokens.primarySoft,
		},
	},
	shape: { borderRadius: radius.md },
	shadows,
	typography,
	components,
});

export default theme;
