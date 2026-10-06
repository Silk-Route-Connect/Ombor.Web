/**
 * Ombor Design System — direction "Bukhara Teal". `src/theme/` is the single
 * styling source: every colour lives here and components reference tokens, never
 * inline values. Contrast figures are WCAG ratios on white unless stated.
 * Human-readable mirror: docs/design-tokens.md (keep it in sync with this folder).
 */

/** Core hues — single source for the MUI palette and the chip tokens. */
export const TEAL_500 = "#12676B"; // PRIMARY (6.6:1)
export const TEAL_600 = "#0D5256"; // hover / pressed
export const TEAL_700 = "#0E4448"; // the navigation panel (white text 10.8:1)
export const SAFFRON_500 = "#D88A1E"; // ACCENT — fills and icons only, never small text
export const SAFFRON_700 = "#8F5A0C"; // accent text / filled accent button bg (white 5.8:1)
export const SUCCESS = "#157A54"; // 5.3:1 (4.8:1 on the canvas)
export const WARNING = "#C57E14"; // 3.3:1 — icons and fills only; text uses WARNING_FG
export const ERROR = "#C53D31"; // 5.1:1
export const INFO = "#2A6F97";
export const INK = "#1C2625"; // fg-1, primary text

/** Text on the semantic tints (chips, tinted tiles) — all ≥5:1 on their own tint. */
export const SUCCESS_FG = "#1C5C40"; // 6.9:1 on successBg
export const DANGER_FG = "#8F2A1F"; // 7.2:1 on errorBg
export const WARNING_FG = "#6D5706"; // 6.2:1 on warningBg
export const INFO_FG = "#245F82"; // 6.0:1 on infoBg

/**
 * The ONE neutral ramp. `designTokens.grayN` and the MUI `palette.grey[N]` both
 * resolve from it, so a step name always means the same colour. Surfaces,
 * borders and text are one cool ink-grey family (hue ≈ 199°, the ink and teal) so the canvas
 * no longer fights the ink: the earlier warm-stone surfaces (#F4F1EA) read as a
 * yellowish, tiring field against the cool text (owner feedback 2026-10-06).
 */
export const NEUTRAL = {
	0: "#FFFFFF", // surface
	25: "#F7F9F9", // bg-subtle — table header / footer bands, subtle fills
	50: "#F1F4F4", // canvas — page background
	100: "#E9EDED", // divider inside panes / sunken fill / neutral chip fill
	200: "#DDE2E2", // border — card and table hairlines (decorative)
	300: "#C8CFCF", // border-strong — ghost buttons, dividers on tints (decorative)
	400: "#A6B0B0", // DECORATION — icons, dots, hairlines. Never text (2.2:1)
	500: "#646C6B", // fg-3 — tertiary / placeholder / meta text (5.4:1; 4.9:1 on the canvas)
	600: "#565F5E", // fg-2 — secondary data text (6.4:1)
	700: "#3E4A4A", // strong secondary text / neutral chip text
	800: "#28302F",
	900: INK, // fg-1
} as const;

/** Input / control outline (3.7:1 on white, 3.3:1 on the canvas — WCAG 1.4.11 for field edges). */
export const BORDER_CONTROL = "#7D8787";

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
	// Butter-yellow, apart from the saffron Supply chip (accentSoft): «Поставка» and
	// «Частично» sat side by side in the same colour.
	warningBg: "#FFF2C8",
	warningBorder: "#ECD388",
	errorBg: "#FBEAE8",
	errorBorder: "#EFC9C4",
	// Leaning yellow-green so «Оплачено» separates from the teal «Продажа» chip.
	successBg: "#E6F3E6",
	successBorder: "#C4DEC5",
	infoBg: "#E7F0F6",
	infoBorder: "#C5DBEA",
	purpleBg: "#ECE7F7", // payroll badge fill (app extension)
	purpleText: "#6A4BB0", // payroll badge text (5.3:1 on purpleBg)
	purpleBorder: "#D6CBEE",
	// overlays on the teal brand panel / dark tooltips
	onDarkMuted: "rgba(255,255,255,0.82)", // secondary text on teal / ink (≥5:1)
	onDarkLine: "rgba(255,255,255,0.14)", // hairline on teal / ink
	onDarkFill: "rgba(255,255,255,0.13)", // chip fill on teal
	onDarkGrid: "rgba(255,255,255,0.10)", // decorative grid on the teal brand panel
	onDarkHover: "rgba(255,255,255,0.08)", // hover wash on teal / ink
	// The sidebar is the brand's one large teal surface (owner feedback 2026-10-06:
	// the all-white chrome read as plain); content surfaces stay light.
	navBg: TEAL_700,
	scrim: "rgba(255,255,255,0.72)", // frosted card over the auth backdrop
	primaryWash: "rgba(18,103,107,0.05)", // chart hover cursor
	scrimModal: "rgba(28,38,37,0.42)", // ink-tinted modal backdrop (MUI's 50% black turned the page flat grey)
	loadingVeil: "rgba(241,244,244,0.6)", // canvas-tinted veil over content while it reloads
} as const;
