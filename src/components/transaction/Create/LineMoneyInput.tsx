import React from "react";
import MoneyField from "components/shared/Inputs/MoneyField";
import { numericSx } from "theme";

import { InputAdornment } from "@mui/material";

interface LineMoneyInputProps {
	id: string;
	value: number;
	onChange: (value: number) => void;
	width: number;
	/** A leading sign inside the field — the «×» of a unit price. */
	prefix?: string;
	/** Enter → continue to the next product (the POS entry loop). */
	onEnter?: () => void;
}

/** A line's money input (unit price, discount) on the theme's 38px field, figures right-aligned. */
export const LineMoneyInput: React.FC<LineMoneyInputProps> = ({
	id,
	value,
	onChange,
	width,
	prefix,
	onEnter,
}) => (
	<MoneyField
		id={id}
		value={value}
		onChange={onChange}
		placeholder="0"
		fullWidth={false}
		onKeyDown={
			onEnter
				? (e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							onEnter();
						}
					}
				: undefined
		}
		sx={{
			width,
			"& .MuiOutlinedInput-input": { textAlign: "right", fontWeight: 600, ...numericSx },
		}}
		slotProps={
			prefix
				? { input: { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } }
				: undefined
		}
	/>
);

export default LineMoneyInput;
