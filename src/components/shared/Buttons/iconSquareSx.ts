import { controlSize, designTokens, radius } from "theme";

/**
 * The bordered 38px square of a header icon control — the ‹ back button and the
 * detail-page ⋮ share it, so both ends of a header read as one family.
 */
export const iconSquareSx = {
	width: controlSize.md.height,
	height: controlSize.md.height,
	flex: "0 0 auto",
	p: 0,
	borderRadius: `${radius.md}px`,
	border: "1px solid",
	borderColor: designTokens.borderStrong,
	bgcolor: "background.paper",
	color: designTokens.fg2,
	"& .MuiSvgIcon-root": { fontSize: 20 },
	"&:hover": { bgcolor: designTokens.bgCanvas, borderColor: designTokens.borderControl },
} as const;
