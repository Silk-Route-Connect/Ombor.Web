import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

export type NumericFieldProps = TextFieldProps & {
	selectOnFocus?: boolean;
};

const NumericField: React.FC<NumericFieldProps> = ({
	selectOnFocus = true,
	fullWidth = true,
	slotProps = {},
	onChange,
	...rest
}) => (
	<TextField
		{...rest}
		sx={{
			"& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
				display: "none",
			},
			"& input[type=number]": {
				MozAppearance: "textfield",
			},
		}}
		type="number"
		fullWidth={fullWidth}
		onChange={(e) => {
			if (!onChange) return;

			/* strip leading zeroes */
			const v = e.target.value;
			if (v.length > 1 && v.startsWith("0")) {
				e.target.value = v.replace(/^0+/, "");
			}
			onChange(e);
		}}
		slotProps={{
			input: {
				inputMode: "decimal",
				...(selectOnFocus && {
					onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
				}),
				...(slotProps?.input ?? {}),
			},
			...slotProps,
		}}
	/>
);

export default NumericField;
