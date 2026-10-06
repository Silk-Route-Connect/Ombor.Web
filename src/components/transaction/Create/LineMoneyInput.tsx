import React from "react";
import MoneyField from "components/shared/Inputs/MoneyField";

import { InputAdornment } from "@mui/material";

interface LineMoneyInputProps {
	id: string;
	value: number;
	onChange: (value: number) => void;
	width: number;
	/** A leading sign inside the field — the «×» of a unit price. */
	prefix?: string;
	/** The «UZS» after the figure; off beside the discount's «% | UZS» toggle. */
	unit?: boolean;
	/** Only while a modal's save is in flight. */
	disabled?: boolean;
	/** Enter → continue to the next product (the POS entry loop). */
	onEnter?: () => void;
}

/** A line's money input (unit price, fixed discount): the shared `MoneyField` at a fixed width. */
export const LineMoneyInput: React.FC<LineMoneyInputProps> = ({
	id,
	value,
	onChange,
	width,
	prefix,
	unit,
	disabled,
	onEnter,
}) => (
	<MoneyField
		id={id}
		value={value}
		onChange={onChange}
		placeholder="0"
		fullWidth={false}
		unit={unit}
		disabled={disabled}
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
		sx={{ width }}
		slotProps={
			prefix
				? { input: { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> } }
				: undefined
		}
	/>
);

export default LineMoneyInput;
