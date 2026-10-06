import { designTokens } from "theme";

/** The bordered input shell of every auth field (the design's `.ainput`). */
export const shellSx = (error?: boolean) =>
	({
		display: "flex",
		alignItems: "center",
		gap: "9px",
		minHeight: 44,
		px: "12px",
		borderRadius: "8px",
		border: "1px solid",
		borderColor: error ? "error.main" : designTokens.borderControl,
		bgcolor: error ? designTokens.errorBg : "background.paper",
		transition: "border-color .14s, box-shadow .14s",
		"&:hover": { borderColor: error ? "error.main" : "text.primary" },
		"&:focus-within": {
			borderColor: error ? "error.main" : "primary.main",
			boxShadow: error
				? `0 0 0 3px ${designTokens.errorBg}`
				: `0 0 0 3px ${designTokens.primarySoft}`,
		},
	}) as const;

export const inputSx = {
	flex: 1,
	minWidth: 0,
	fontSize: 14,
	"& input::placeholder": { color: "text.disabled", opacity: 1 },
	// Suppress the browser autofill background tint — keep the field on the shell's
	// own (white) background. The long transition defers the autofill paint.
	"& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active":
		{
			transition: "background-color 9999s ease-in-out 0s",
			WebkitTextFillColor: "currentColor",
			caretColor: "currentColor",
		},
} as const;

export const labelSx = {
	fontSize: 13,
	fontWeight: 600,
	color: designTokens.gray700,
	display: "flex",
	alignItems: "center",
	gap: "6px",
} as const;

export const leadingIconSx = {
	display: "inline-flex",
	color: "text.disabled",
	flex: "0 0 auto",
} as const;
