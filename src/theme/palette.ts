/**
 * Ombor Design System — direction "Bukhara Teal". `src/theme/` is the single
 * styling source: every colour lives here and components reference tokens, never
 * inline values. Contrast figures are WCAG ratios on white unless stated.
 * Human-readable mirror: docs/design-tokens.md (keep it in sync with this folder).
 */

/** Core hues — single source for the MUI palette and the chip tokens. */
export const TEAL_500 = "#12676B"; // PRIMARY (6.6:1)
export const TEAL_600 = "#0D5256"; // hover / pressed
export const SAFFRON_500 = "#D88A1E"; // ACCENT — fills and icons only, never small text
export const SAFFRON_700 = "#8F5A0C"; // accent text / filled accent button bg (white 5.8:1)
export const SUCCESS = "#17835A"; // 4.7:1
export const WARNING = "#C57E14"; // 3.3:1 — icons and fills only; text uses WARNING_FG
export const ERROR = "#C53D31"; // 5.1:1
export const INFO = "#2A6F97";
export const INK = "#1C2625"; // fg-1, primary text

/** Text on the semantic tints (chips, tinted tiles) — all ≥5:1 on their own tint. */
export const SUCCESS_FG = "#1C5C40"; // 6.9:1 on successBg
export const DANGER_FG = "#8F2A1F"; // 7.2:1 on errorBg
export const WARNING_FG = "#8A5A0E"; // 5.2:1 on warningBg
export const INFO_FG = "#245F82"; // 6.0:1 on infoBg

/**
 * The ONE neutral ramp. `designTokens.grayN` and the MUI `palette.grey[N]` both
 * resolve from it, so a step name always means the same colour. Surfaces and
 * borders are warm stone; the text steps (500+) are the cool ink family.
 */
export const NEUTRAL = {
	0: "#FFFFFF", // surface
	25: "#FAF8F4", // bg-subtle — zebra rows, subtle fills
	50: "#F4F1EA", // canvas — page background
	100: "#ECE8DF", // divider inside panes / sunken fill / neutral chip fill
	200: "#E4DFD5", // border — card and table hairlines (decorative)
	300: "#D4CDBF", // border-strong — ghost buttons, dividers on tints (decorative)
	400: "#B8AF9F", // DECORATION — icons, dots, hairlines. Never text (2.2:1)
	500: "#6B7473", // fg-3 — tertiary / placeholder / meta text (4.8:1; 4.5:1 on bg-subtle)
	600: "#565F5E", // fg-2 — secondary data text (6.4:1)
	700: "#3E4A4A", // strong secondary text / neutral chip text
	800: "#28302F",
	900: INK, // fg-1
} as const;

/** Input / control outline — stone-500 (3.7:1, meets WCAG 1.4.11 for field edges). */
export const BORDER_CONTROL = "#8C8576";

/**
 * Design-token values for slots the MUI palette has no home for. Prefer the
 * semantic aliases (fg3, decoration, border…) in new code; the numeric steps
 * are the same ramp as `palette.grey`.
 */
export const designTokens = {
	gray0: NEUTRAL[0],
	gray25: NEUTRAL[25],
	gray50: NEUTRAL[50],
	gray100: NEUTRAL[100],
	gray200: NEUTRAL[200],
	gray300: NEUTRAL[300],
	gray400: NEUTRAL[400],
	gray500: NEUTRAL[500],
	gray600: NEUTRAL[600],
	gray700: NEUTRAL[700],
	gray800: NEUTRAL[800],
	gray900: NEUTRAL[900],
	// semantic aliases over the ramp
	bgCanvas: NEUTRAL[50],
	bgSubtle: NEUTRAL[25],
	border: NEUTRAL[200],
	borderStrong: NEUTRAL[300],
	borderControl: BORDER_CONTROL,
	decoration: NEUTRAL[400],
	fg1: INK,
	fg2: NEUTRAL[600],
	fg3: NEUTRAL[500],
	textSecondary: NEUTRAL[600],
	// on-tint text (chips, tinted tiles)
	successFg: SUCCESS_FG,
	dangerFg: DANGER_FG,
	warningFg: WARNING_FG,
	infoFg: INFO_FG,
	// saffron (accent) ramp
	saffron100: "#F6DEAE", // supply chip border
	saffron600: "#B5710F", // archive action icon
	saffron700: SAFFRON_700, // supply chip text / archive action text
	accentSoft: "#FBF0DC", // supply chip fill
	// Brand mark only — the monogram's saffron keystone (DS accent).
	logoKeystone: "#B8860B",
	// primary tints
	primaryLine: "#C3DEDE", // hairline on teal tints
	primarySoft: "#E1EEEE", // selected row / active nav / sale chip fill
	// semantic tints (soft chip fills + outlines)
	warningBg: "#FBF0DC",
	warningBorder: "#EDD3A4",
	errorBg: "#FBEAE8",
	errorBorder: "#EFC9C4",
	successBg: "#E5F2EC",
	successBorder: "#C2E0D2",
	infoBg: "#E7F0F6",
	infoBorder: "#C5DBEA",
	saffronBadgeBorder: "#ECD3A4",
	purpleBg: "#ECE7F7", // payroll badge fill (app extension)
	purpleText: "#6A4BB0", // payroll badge text (5.3:1 on purpleBg)
	purpleBorder: "#D6CBEE",
	// overlays on the teal brand panel / dark tooltips
	onDarkMuted: "rgba(255,255,255,0.82)", // secondary text on teal / ink (≥5:1)
	onDarkLine: "rgba(255,255,255,0.14)", // hairline on teal / ink
	onDarkFill: "rgba(255,255,255,0.13)", // chip fill on teal
	scrim: "rgba(255,255,255,0.72)", // frosted card over the auth backdrop
	primaryWash: "rgba(18,103,107,0.05)", // chart hover cursor
	// One visible keyboard-focus ring (6.6:1): white gap + teal ring.
	focusRing: `0 0 0 2px ${NEUTRAL[0]}, 0 0 0 4px ${TEAL_500}`,
} as const;
