import React, { useState } from "react";

import { InputAdornment } from "@mui/material";
import TextField, { TextFieldProps } from "@mui/material/TextField";

import { figureInputSx } from "./figureInput";
import { formatPercentInput, isPercentDraft, parsePercentInput } from "./percentInput";

export type PercentFieldProps = Omit<
	TextFieldProps,
	"type" | "value" | "defaultValue" | "onChange" | "inputMode"
> & {
	/** The percent (1.5 = 1.5 %); 0 shows an empty field. */
	value: number;
	onChange: (value: number) => void;
	selectOnFocus?: boolean;
	/** The «%» end adornment; off beside a «% | UZS» toggle that already names the unit. */
	unit?: boolean;
};

/**
 * Percent input (line and bulk discounts): accepts «1,5» and «1.5» as 1.5 %, up
 * to two decimals — a third decimal or a second separator is refused keystroke
 * by keystroke. The typed text is kept while it still means the value («1,» stays
 * while it reads 1), so the comma can be typed; an outside write (a bulk discount
 * applied) shows the new value. Figures read like `MoneyField`'s.
 */
const PercentField: React.FC<PercentFieldProps> = ({
	value,
	onChange,
	onBlur,
	selectOnFocus = true,
	unit = true,
	fullWidth = true,
	slotProps,
	sx,
	...rest
}) => {
	const [draft, setDraft] = useState<string | null>(null);
	const held = draft !== null && parsePercentInput(draft) === value ? draft : null;

	const handleChange = (raw: string) => {
		const text = raw.replace(/\s/g, "");
		if (!isPercentDraft(text)) {
			return;
		}
		setDraft(text);
		onChange(parsePercentInput(text));
	};

	const callerInput = (slotProps?.input ?? {}) as Record<string, unknown>;
	const callerHtmlInput = (slotProps?.htmlInput ?? {}) as Record<string, unknown>;

	return (
		<TextField
			{...rest}
			value={held ?? formatPercentInput(value)}
			onChange={(e) => handleChange(e.target.value)}
			onBlur={(e) => {
				setDraft(null);
				onBlur?.(e);
			}}
			fullWidth={fullWidth}
			sx={[figureInputSx, ...(Array.isArray(sx) ? sx : [sx])]}
			slotProps={{
				...slotProps,
				input: {
					...(unit && { endAdornment: <InputAdornment position="end">%</InputAdornment> }),
					...(selectOnFocus && {
						onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
					}),
					...callerInput,
				},
				htmlInput: { inputMode: "decimal", ...callerHtmlInput },
			}}
		/>
	);
};

export default PercentField;
