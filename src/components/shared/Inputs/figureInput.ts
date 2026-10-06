import { numericSx } from "theme";

/**
 * How a figure reads inside an input — money and percent alike: right-aligned
 * tabular figures at the 600 money weight, so a typed amount lines up with the
 * table money columns and every amount field reads the same.
 */
export const figureInputSx = {
	"& .MuiInputBase-input": { textAlign: "right", fontWeight: 600, ...numericSx },
} as const;
