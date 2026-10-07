import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Measurement } from "models/product";
import { measurementShort } from "utils/productUtils";
import {
	allowsFractionalThreshold,
	formatThresholdInput,
	isThresholdDraft,
	parseThresholdInput,
} from "utils/thresholdInput";

import { InputAdornment, TextField, TextFieldProps } from "@mui/material";

export type ThresholdFieldProps = Omit<
	TextFieldProps,
	"type" | "value" | "defaultValue" | "onChange" | "ref"
> & {
	/** The committed threshold; null = not tracked; NaN while a counted unit holds a «,». */
	value: number | null | undefined;
	onChange: (value: number | null) => void;
	/** The product's unit: the end adornment, and whether a fraction is allowed. */
	measurement: Measurement;
	ref?: React.Ref<HTMLInputElement>;
	/** False where a line editor shows the message at row level; the field still turns red. */
	inlineHint?: boolean;
};

const draftMatches = (draft: string, value: number | null | undefined, fraction: boolean) => {
	const parsed = parseThresholdInput(draft, fraction);
	if (parsed.kind === "value") {
		return parsed.value === value;
	}
	return parsed.kind === "empty" ? value == null : value != null && Number.isNaN(value);
};

/**
 * A warehouse row's «Заканчивается» threshold (DR-41): empty means not tracked.
 * Weight units take «2,5»; counted units are whole — a typed «,» stays visible
 * and flags the field instead of being stripped into a ten times larger number.
 */
const ThresholdField: React.FC<ThresholdFieldProps> = ({
	value,
	onChange,
	measurement,
	ref,
	inlineHint = true,
	onBlur,
	error,
	helperText,
	slotProps,
	...rest
}) => {
	const { t } = useTranslation();
	const fraction = allowsFractionalThreshold(measurement);
	const unit = measurementShort(t, measurement);
	const [draft, setDraft] = useState<string | null>(null);
	const heldDraft = draft !== null && draftMatches(draft, value, fraction) ? draft : null;
	const notWhole =
		heldDraft !== null && parseThresholdInput(heldDraft, fraction).kind === "notWhole";

	const handleChange = (raw: string) => {
		if (!isThresholdDraft(raw)) {
			return;
		}
		setDraft(raw);
		const parsed = parseThresholdInput(raw, fraction);
		onChange(parsed.kind === "value" ? parsed.value : parsed.kind === "empty" ? null : Number.NaN);
	};

	return (
		<TextField
			{...rest}
			fullWidth
			inputRef={ref}
			value={heldDraft ?? formatThresholdInput(value)}
			onChange={(e) => handleChange(e.target.value)}
			onBlur={(e) => {
				if (!notWhole) {
					setDraft(null);
				}
				onBlur?.(e);
			}}
			error={notWhole || error}
			helperText={notWhole && inlineHint ? t("warehouse.threshold.wholeOnly") : helperText}
			slotProps={{
				...slotProps,
				input: {
					onFocus: (e: React.FocusEvent<HTMLInputElement>) => e.target.select(),
					...(unit && { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> }),
				},
				htmlInput: { inputMode: fraction ? "decimal" : "numeric" },
			}}
		/>
	);
};

export default ThresholdField;
