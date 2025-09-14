import React from "react";

import TextField, { TextFieldProps } from "@mui/material/TextField";

/**
 * Numeric wrapper that exposes `min / max / step` cleanly while
 * forwarding every other TextField prop unchanged.
 */
export type NumericFieldProps = Omit<TextFieldProps, "type"> & {
	min?: number;
	max?: number;
	step?: number;
	selectOnFocus?: boolean;
};

const NumericField: React.FC<NumericFieldProps> = ({
	min,
	max,
	step,
	selectOnFocus = true,
	fullWidth = true,
	slotProps = {},
	onChange,
	...rest
}) => (
	<TextField
		{...rest}
		type="number"
		fullWidth={fullWidth}
		sx={{
			"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
				display: "none",
			},
			"& input[type=number]": {
				MozAppearance: "textfield",
			},
			...rest.sx,
		}}
		onChange={(e) => {
			if (!onChange) return;

			/* strip leading zeros */
			const v = e.target.value;
			if (v.length > 1 && v.startsWith("0")) {
				e.target.value = v.replace(/^0+/, "");
			}
			onChange(e);
		}}
		slotProps={{
			input: {
				inputMode: "decimal",
				inputProps: { min, max, step },
				...(selectOnFocus && {
					onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
				}),
				/* caller overrides last */
				...slotProps.input,
			},
			...slotProps,
		}}
	/>
);

export default NumericField;
