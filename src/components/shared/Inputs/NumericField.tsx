// src/components/shared/NumberField.tsx
import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

export type NumberFieldProps = TextFieldProps & {
	selectOnFocus?: boolean;
};

const NumericField: React.FC<NumberFieldProps> = ({ selectOnFocus = true, slotProps, ...rest }) => {
	return (
		<TextField
			{...rest}
			type="number"
			fullWidth
			slotProps={{
				input: {
					inputMode: "decimal",
					...(selectOnFocus && {
						onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
							e.target.select();
						},
					}),
					...(slotProps?.input ?? {}),
				},
				...slotProps,
			}}
		/>
	);
};

export default NumericField;
