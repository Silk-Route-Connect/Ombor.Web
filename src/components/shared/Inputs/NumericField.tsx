import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { isQuantityDraft, parseWholeQuantity } from "utils/quantityInput";

import TextField, { TextFieldProps } from "@mui/material/TextField";

export type NumericFieldProps = Omit<
	TextFieldProps,
	"type" | "value" | "defaultValue" | "onChange" | "ref"
> & {
	/** The committed whole quantity; 0, null and NaN show an empty field. */
	value: number | null | undefined;
	/** A whole number, 0 when cleared, NaN while the text holds a «,» / «.» (fails the form's schema). */
	onChange: (value: number) => void;
	/** react-hook-form's `field.ref` lands on the input, so focus-on-error reaches it. */
	ref?: React.Ref<HTMLInputElement>;
	selectOnFocus?: boolean;
	/** False where the caller shows the schema message itself (a line editor's row error); the field still turns red. */
	inlineHint?: boolean;
};

const shownValue = (value: number | null | undefined): string =>
	value != null && Number.isFinite(value) && value !== 0 ? String(value) : "";

/** True while the typed text still means the committed value (a reset or an outside write drops the draft). */
const draftMatches = (draft: string, value: number | null | undefined): boolean => {
	const parsed = parseWholeQuantity(draft);
	if (parsed.kind === "whole") {
		return parsed.value === value;
	}
	if (parsed.kind === "empty") {
		return !value;
	}
	return value != null && Number.isNaN(value);
};

/**
 * Whole-quantity input (packaging size, stock adjustment, transfer and opening
 * stock lines). Base-unit quantities are whole numbers (rule 21): a typed «1,5»
 * stays visible, flags the field with «Количество — только целое число» and
 * commits NaN so the form cannot submit — a native number input dropped the comma
 * and saved 15. Letters are refused keystroke by keystroke.
 */
const NumericField: React.FC<NumericFieldProps> = ({
	value,
	onChange,
	onBlur,
	ref,
	selectOnFocus = true,
	inlineHint = true,
	fullWidth = true,
	error,
	helperText,
	slotProps,
	...rest
}) => {
	const { t } = useTranslation();
	const [draft, setDraft] = useState<string | null>(null);
	const heldDraft = draft !== null && draftMatches(draft, value) ? draft : null;
	const parsedDraft = heldDraft === null ? null : parseWholeQuantity(heldDraft);
	const notWhole = parsedDraft?.kind === "fraction" || parsedDraft?.kind === "invalid";

	const handleChange = (raw: string) => {
		if (!isQuantityDraft(raw)) {
			return;
		}
		setDraft(raw);
		const parsed = parseWholeQuantity(raw);
		if (parsed.kind === "whole") {
			onChange(parsed.value);
		} else {
			onChange(parsed.kind === "empty" ? 0 : Number.NaN);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		// A whole value is re-shown normalized («007» → «7»); a «1,5» stays for the user to fix.
		if (!notWhole) {
			setDraft(null);
		}
		onBlur?.(e);
	};

	// Callers add their own input slot (an end adornment); it merges with ours, never replaces it.
	const callerInput = (slotProps?.input ?? {}) as Record<string, unknown>;
	const callerHtmlInput = (slotProps?.htmlInput ?? {}) as Record<string, unknown>;

	return (
		<TextField
			{...rest}
			fullWidth={fullWidth}
			inputRef={ref}
			value={heldDraft ?? shownValue(value)}
			onChange={(e) => handleChange(e.target.value)}
			onBlur={handleBlur}
			error={notWhole || error}
			helperText={notWhole && inlineHint ? t("common.quantity.wholeOnly") : helperText}
			slotProps={{
				...slotProps,
				input: {
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

export default NumericField;
