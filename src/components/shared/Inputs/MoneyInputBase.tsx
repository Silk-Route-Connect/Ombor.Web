import React from "react";

import InputBase, { InputBaseProps } from "@mui/material/InputBase";

import { formatMoneyInput, parseMoneyInput } from "./moneyInput";

export type MoneyInputBaseProps = Omit<
	InputBaseProps,
	"value" | "onChange" | "type" | "inputMode"
> & {
	/** The raw amount in UZS (whole number). */
	value: number;
	/** Receives the parsed raw amount (not the formatted string). */
	onChange: (value: number) => void;
	/** Optional ceiling; the entered amount is clamped to it. */
	max?: number;
	selectOnFocus?: boolean;
};

/**
 * The bare-`InputBase` twin of `MoneyField`: same live thousands grouping
 * («5 000 000») and raw-integer state, but unstyled so it drops into the POS
 * cart-line and tender boxes (custom bordered containers) without dragging in
 * TextField chrome. Format/parse is shared via `./moneyInput`.
 */
const MoneyInputBase: React.FC<MoneyInputBaseProps> = ({
	value,
	onChange,
	max,
	selectOnFocus = true,
	onFocus,
	inputProps,
	...rest
}) => (
	<InputBase
		{...rest}
		value={formatMoneyInput(value)}
		onChange={(e) => onChange(parseMoneyInput(e.target.value, max))}
		onFocus={(e) => {
			if (selectOnFocus) {
				e.currentTarget.select();
			}
			onFocus?.(e);
		}}
		inputProps={{ inputMode: "numeric", ...inputProps }}
	/>
);

export default MoneyInputBase;
