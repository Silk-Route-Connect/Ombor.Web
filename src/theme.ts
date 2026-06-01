import { createTheme } from "@mui/material/styles";

/* ============================================================
   OMBOR — MUI theme · Direction "Bukhara Teal"
   Implements the Claude Design handoff (tokens.css) as the
   single source of truth for the app's visual system.
   Light mode only — dark mode is intentionally out of v1.
   Numbers are the hero: tabular figures applied app-wide.
   ============================================================ */

// ---------- Palette tokens ----------
const teal = {
	50: "#E6F2F2",
	100: "#C5E2E2",
	200: "#9CCCCD",
	300: "#5FAAAC",
	400: "#2A8689",
	500: "#12676B", // PRIMARY
	600: "#0D5256", // hover / pressed
	700: "#0A4144",
	800: "#073033",
	900: "#052224",
} as const;

const saffron = {
	50: "#FBF0DC",
	100: "#F6DEAE",
	300: "#E6A943",
	500: "#D88A1E", // ACCENT
	600: "#B5710F",
	700: "#8F5A0C",
} as const;

// Warm-cool neutral ramp (faint teal cast)
const gray = {
	0: "#FFFFFF",
	25: "#F8FAFA",
	50: "#F1F4F3", // app canvas
	100: "#E8ECEB",
	200: "#E1E8E6", // default border / divider
	300: "#CDD6D5", // input outline
	400: "#A7B2B1", // placeholder / disabled text
	500: "#7E8A89",
	600: "#5E6E6E", // secondary text
	700: "#3E4A4A",
	800: "#28302F",
	900: "#162A2B", // ink / primary text
} as const;

// Semantic + the soft/border companions used for chips and tinted surfaces
export const semantic = {
	primarySoft: "#E1EEEE", // active nav / selected row tint
	primaryLine: "#C3DEDE",
	accentSoft: "#FBF0DC",
	success: { main: "#17835A", bg: "#E5F2EC", border: "#C2E0D2" },
	warning: { main: "#C57E14", bg: "#FBF0DC", border: "#EDD3A4" },
	error: { main: "#C53D31", bg: "#FBEAE8", border: "#EFC9C4" },
	info: { main: "#2A6F97", bg: "#E7F0F6", border: "#C5DBEA" },
	// app-wide balance sign convention: green = they owe us, red = we owe
	balancePos: "#17835A",
	balanceNeg: "#C53D31",
} as const;

// ---------- Elevation (border-first, restrained) ----------
const E1 = "0 1px 2px rgba(22,42,43,.05), 0 1px 3px rgba(22,42,43,.06)";
const E2 = "0 2px 6px rgba(22,42,43,.06), 0 6px 16px rgba(22,42,43,.06)";
const E3 = "0 10px 24px rgba(22,42,43,.10), 0 24px 60px rgba(22,42,43,.12)";
const FOCUS_RING = "0 0 0 3px rgba(18,103,107,.22)";

// MUI requires a 25-entry shadow scale. Map low elevations to E1,
// mid to E2, and high (modals/drawers) to E3.
const shadows = [
	"none",
	E1,
	E1,
	E2,
	E2,
	E2,
	E2,
	E2,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
	E3,
] as unknown as import("@mui/material/styles").Shadows;

const FONT_FAMILY = "'Onest', system-ui, -apple-system, 'Segoe UI', sans-serif";

const theme = createTheme({
	palette: {
		mode: "light",
		primary: {
			main: teal[500],
			dark: teal[600],
			light: semantic.primarySoft,
			contrastText: "#FFFFFF",
		},
		secondary: {
			main: saffron[500],
			dark: saffron[600],
			light: semantic.accentSoft,
			contrastText: "#FFFFFF",
		},
		success: { main: semantic.success.main, light: semantic.success.bg, contrastText: "#FFFFFF" },
		warning: { main: semantic.warning.main, light: semantic.warning.bg, contrastText: "#FFFFFF" },
		error: { main: semantic.error.main, light: semantic.error.bg, contrastText: "#FFFFFF" },
		info: { main: semantic.info.main, light: semantic.info.bg, contrastText: "#FFFFFF" },
		grey: {
			50: gray[50],
			100: gray[100],
			200: gray[200],
			300: gray[300],
			400: gray[400],
			500: gray[500],
			600: gray[600],
			700: gray[700],
			800: gray[800],
			900: gray[900],
		},
		background: {
			default: gray[50],
			paper: gray[0],
		},
		text: {
			primary: gray[900],
			secondary: gray[600],
			disabled: gray[400],
		},
		divider: gray[200],
		action: {
			hover: gray[25],
			selected: semantic.primarySoft,
			disabled: gray[400],
			disabledBackground: gray[200],
		},
	},

	shape: { borderRadius: 8 },
	shadows,

	typography: {
		fontFamily: FONT_FAMILY,
		// numbers are the hero — tabular figures everywhere
		allVariants: { fontVariantNumeric: "tabular-nums" },
		h1: { fontSize: "1.625rem", lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.02em" }, // 26px
		h2: { fontSize: "1.25rem", lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.01em" }, // 20px
		h3: { fontSize: "1rem", lineHeight: "22px", fontWeight: 600 }, // 16px
		h4: { fontSize: "1.125rem", lineHeight: "26px", fontWeight: 700, letterSpacing: "-0.01em" }, // 18px
		h5: { fontSize: "1.25rem", lineHeight: "28px", fontWeight: 700, letterSpacing: "-0.01em" }, // 20px
		h6: { fontSize: "1rem", lineHeight: "22px", fontWeight: 600 }, // 16px
		subtitle1: { fontSize: "0.9375rem", lineHeight: "22px", fontWeight: 600 }, // 15px
		subtitle2: { fontSize: "0.8125rem", lineHeight: "18px", fontWeight: 600 }, // 13px
		body1: { fontSize: "0.9375rem", lineHeight: "22px", fontWeight: 400 }, // 15px
		body2: { fontSize: "0.875rem", lineHeight: "20px", fontWeight: 400 }, // 14px
		caption: { fontSize: "0.75rem", lineHeight: "16px", fontWeight: 400 }, // 12px
		overline: {
			fontSize: "0.6875rem", // 11px
			lineHeight: "16px",
			fontWeight: 700,
			letterSpacing: "0.12em",
			textTransform: "uppercase",
		},
		button: { fontSize: "0.875rem", fontWeight: 600, textTransform: "none" },
	},

	components: {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					borderRadius: 8,
					fontWeight: 600,
					textTransform: "none",
					boxShadow: "none",
					"&:focus-visible": { boxShadow: FOCUS_RING },
				},
				sizeSmall: { borderRadius: 6, padding: "6px 12px" },
				sizeMedium: { padding: "8px 16px" },
				containedPrimary: { "&:hover": { backgroundColor: teal[600] } },
				containedSecondary: { "&:hover": { backgroundColor: saffron[600] } },
				outlined: {
					borderColor: gray[300],
					color: gray[900],
					"&:hover": { backgroundColor: gray[50], borderColor: gray[400] },
				},
			},
		},

		MuiPaper: {
			styleOverrides: {
				root: { backgroundImage: "none" },
				rounded: { borderRadius: 12 },
			},
		},

		MuiAppBar: {
			defaultProps: { elevation: 0, color: "inherit" },
			styleOverrides: {
				root: {
					backgroundColor: gray[0],
					color: gray[900],
					borderBottom: `1px solid ${gray[200]}`,
					boxShadow: "none",
				},
			},
		},

		MuiDrawer: {
			styleOverrides: {
				paper: { backgroundColor: gray[0], borderRight: `1px solid ${gray[200]}` },
			},
		},

		MuiListItemButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					"&.Mui-selected": {
						backgroundColor: semantic.primarySoft,
						color: teal[500],
						"&:hover": { backgroundColor: semantic.primarySoft },
					},
				},
			},
		},

		MuiTableCell: {
			styleOverrides: {
				root: { borderColor: gray[200], fontSize: "0.875rem" },
				head: { fontWeight: 600, color: gray[600], fontSize: "0.75rem", letterSpacing: "0.01em" },
			},
		},

		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					backgroundColor: gray[0],
					"& .MuiOutlinedInput-notchedOutline": { borderColor: gray[300] },
					"&:hover .MuiOutlinedInput-notchedOutline": { borderColor: gray[400] },
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: teal[500],
						borderWidth: 1,
					},
					"&.Mui-focused": { boxShadow: FOCUS_RING },
				},
			},
		},

		MuiInputLabel: {
			styleOverrides: { root: { fontSize: "0.875rem", "&.Mui-focused": { color: teal[500] } } },
		},

		MuiChip: {
			styleOverrides: {
				root: { borderRadius: 999, fontWeight: 600, fontSize: "0.75rem" },
				sizeSmall: { fontSize: "0.6875rem" },
			},
		},

		MuiTooltip: {
			styleOverrides: {
				tooltip: {
					backgroundColor: gray[800],
					fontSize: "0.75rem",
					fontWeight: 500,
					borderRadius: 6,
					padding: "6px 10px",
				},
				arrow: { color: gray[800] },
			},
		},

		MuiDialog: {
			styleOverrides: { paper: { borderRadius: 12, boxShadow: E3 } },
		},

		MuiMenu: {
			styleOverrides: {
				paper: { borderRadius: 8, boxShadow: E2, border: `1px solid ${gray[200]}` },
			},
		},

		MuiPopover: {
			styleOverrides: {
				paper: { borderRadius: 8, boxShadow: E2 },
			},
		},

		MuiLink: {
			defaultProps: { underline: "hover" },
			styleOverrides: { root: { color: teal[500], fontWeight: 600 } },
		},
	},
});

export default theme;
