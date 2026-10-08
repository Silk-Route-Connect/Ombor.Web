import React from "react";
import UzsAdornment from "components/shared/Money/UzsAdornment";

import TextField, { TextFieldProps } from "@mui/material/TextField";

import { figureInputSx } from "./figureInput";
import { formatMoneyInput, parseMoneyInput } from "./moneyInput";

export type MoneyFieldProps = Omit<TextFieldProps, "type" | "value" | "onChange" | "inputMode"> & {
	/** The raw amount in UZS (whole number). */
	value: number;
	/** Receives the parsed raw amount (not the formatted string). */
	onChange: (value: number) => void;
	/** Optional ceiling; the entered amount is clamped to it. */
	max?: number;
	selectOnFocus?: boolean;
	/** The «UZS» end adornment; off beside a «% | UZS» toggle that already names the unit. */
	unit?: boolean;
	/**
	 * A sign written with the figure («−1 250 000») where the amount is entered
	 * unsigned but read signed — the partner opening balance (DR-27). Typing ignores it.
	 */
	sign?: "−" | "+";
};

/**
 * The money input — every amount a user types goes through it. Shows
 * thousands-separated digits as you type («150 000») while storing the raw
 * integer in form state; UZS-only — whole numbers, no decimals (F-024). Reads
 * the same everywhere: right-aligned tabular figures (like the table money
 * columns) and «UZS» after them. Empty renders blank (value 0) so the
 * placeholder shows. Format/parse lives in `./moneyInput`.
 */
const MoneyField: React.FC<MoneyFieldProps> = ({
	value,
	onChange,
	max,
	selectOnFocus = true,
	unit = true,
	sign,
	fullWidth = true,
	slotProps = {},
	sx,
	...rest
}) => {
	const figure = formatMoneyInput(value);
	const callerInput = (slotProps.input ?? {}) as Record<string, unknown>;
	const callerHtmlInput = (slotProps.htmlInput ?? {}) as Record<string, unknown>;

	return (
		<TextField
			{...rest}
			value={sign && figure ? `${sign}${figure}` : figure}
			onChange={(e) => onChange(parseMoneyInput(e.target.value, max))}
			fullWidth={fullWidth}
			sx={[figureInputSx, ...(Array.isArray(sx) ? sx : [sx])]}
			slotProps={{
				...slotProps,
				input: {
					...(unit && { endAdornment: <UzsAdornment /> }),
					...(selectOnFocus && {
						onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
					}),
					...callerInput,
				},
				htmlInput: { inputMode: "numeric", ...callerHtmlInput },
			}}
		/>
	);
};

export default MoneyField;
