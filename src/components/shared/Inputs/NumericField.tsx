import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

export type NumericField = TextFieldProps & {
	selectOnFocus?: boolean;
};

const NumericField: React.FC<NumericField> = ({
	selectOnFocus = true,
	fullWidth = true,
	slotProps = {},
	onChange,
	...rest
}) => {
	return (
		<TextField
			{...rest}
			type="number"
			fullWidth={fullWidth}
			onChange={(e) => {
				if (!onChange) {
					return;
				}

				const value = e.target.value;
				if (value.length > 1 && value.startsWith("0")) {
					e.target.value = value.replace(/^0+/, "");
				}

				onChange(e);
			}}
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
