import React from "react";

import TextField, { TextFieldProps } from "@mui/material/TextField";

import { formatMoneyInput, parseMoneyInput } from "./moneyInput";

export type MoneyFieldProps = Omit<TextFieldProps, "type" | "value" | "onChange" | "inputMode"> & {
	/** The raw amount in UZS (whole number). */
	value: number;
	/** Receives the parsed raw amount (not the formatted string). */
	onChange: (value: number) => void;
	/** Optional ceiling; the entered amount is clamped to it. */
	max?: number;
	selectOnFocus?: boolean;
};

/**
 * Money input that shows thousands-separated digits as you type («150 000») while
 * storing the raw integer value in form state. UZS-only — whole numbers, no
 * decimals (F-024). Empty renders as blank (value 0) so the placeholder shows.
 * Format/parse lives in `./moneyInput` — shared with `MoneyInputBase`.
 */
const MoneyField: React.FC<MoneyFieldProps> = ({
	value,
	onChange,
	max,
	selectOnFocus = true,
	fullWidth = true,
	slotProps = {},
	...rest
}) => {
	const display = formatMoneyInput(value);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void =>
		onChange(parseMoneyInput(e.target.value, max));

	return (
		<TextField
			{...rest}
			value={display}
			onChange={handleChange}
			fullWidth={fullWidth}
			slotProps={{
				...slotProps,
				input: {
					inputMode: "numeric",
					...(selectOnFocus && {
						onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
					}),
					...slotProps.input,
				},
			}}
		/>
	);
};

export default MoneyField;
