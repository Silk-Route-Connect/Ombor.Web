import type { TypographyVariantsOptions } from "@mui/material/styles";

const UI_FONT_FAMILY = '"Onest", system-ui, -apple-system, "Segoe UI", sans-serif';

/**
 * The type scale. Every MUI variant is defined so no MUI default leaks in
 * (DialogTitle renders `h6`, so h6 = the 18/700 dialog title). Weights 400–700
 * only — Onest 800 is not loaded. Text sizes outside this scale are a defect.
 */
export const typography: TypographyVariantsOptions = {
	fontFamily: UI_FONT_FAMILY,
	h1: { fontSize: 26, lineHeight: "32px", fontWeight: 700, letterSpacing: "-0.02em" }, // page title
	h2: { fontSize: 20, lineHeight: "28px", fontWeight: 600, letterSpacing: "-0.02em" }, // section
	h3: { fontSize: 16, lineHeight: "22px", fontWeight: 600 }, // card title
	h4: { fontSize: 18, lineHeight: "24px", fontWeight: 700, letterSpacing: "-0.01em" }, // dialog title
	h5: { fontSize: 16, lineHeight: "22px", fontWeight: 600 }, // = h3
	h6: { fontSize: 18, lineHeight: "24px", fontWeight: 700, letterSpacing: "-0.01em" }, // = h4 (DialogTitle)
	subtitle1: { fontSize: 14, lineHeight: "20px", fontWeight: 600 },
	subtitle2: { fontSize: 13, lineHeight: "18px", fontWeight: 600 },
	body1: { fontSize: 14, lineHeight: "20px" }, // body
	body2: { fontSize: 13, lineHeight: "18px" }, // bodySm
	caption: { fontSize: 12, lineHeight: "16px", fontWeight: 400 },
	overline: {
		fontSize: 11,
		lineHeight: "16px",
		fontWeight: 700,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
	},
	button: { textTransform: "none", fontWeight: 600 },
};
