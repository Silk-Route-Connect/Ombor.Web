import React, { useId, useState } from "react";
import { iconSize } from "theme";

import type { SxProps, Theme } from "@mui/material";

import { fromPickerDate, toPickerDate } from "./pickerValue";

/** What `DateField` and `TimeField` share: a string value in, the same string format out. */
export interface PickerFieldProps {
	/** The form's value in the field's string format; "" for none. */
	value: string;
	/**
	 * The new value once the entry is complete and real; "" when it is cleared or
	 * left incomplete (the caller's required check then fires as before).
	 */
	onChange: (value: string) => void;
	/** The caller's error (a required check); the field also marks an entry it cannot read. */
	error?: boolean;
	helperText?: string;
	disabled?: boolean;
	autoFocus?: boolean;
	/** A «×» on hover / focus that empties the field — for optional fields. */
	clearable?: boolean;
	/** Stretch to the container (default); `false` keeps the field's own width (`sx`). */
	fullWidth?: boolean;
	onBlur?: () => void;
	name?: string;
	/** react-hook-form's `field.ref`, so a submit error can focus the field. */
	inputRef?: React.Ref<HTMLInputElement>;
	sx?: SxProps<Theme>;
}

/**
 * Slot props that never change — module constants, so an open popup's Popper is
 * not rebuilt on every render of the form around it (a new `modifiers` array
 * re-creates the popper instance).
 */
const STATIC_SLOT_PROPS = {
	openPickerButton: { size: "small" as const },
	openPickerIcon: { sx: { fontSize: iconSize.md } },
	clearIcon: { sx: { fontSize: iconSize.md } },
	popper: { modifiers: [{ name: "offset", options: { offset: [0, 6] } }] },
};

/**
 * Picker props shared by the date and time fields. The picker holds a `Date`
 * draft of its own: a half-typed entry («07.1М.ГГГГ») is reported to the form as
 * "", and handing "" back must not wipe what the user is still typing — the
 * draft is replaced only when the form itself changes the value (a reset, a
 * default, a day capped by the page).
 */
export function usePickerField(
	{
		value,
		onChange,
		error,
		helperText,
		disabled,
		autoFocus,
		clearable,
		fullWidth = true,
		onBlur,
		name,
		inputRef,
		sx,
	}: PickerFieldProps,
	valueFormat: string,
	icon: React.ElementType,
) {
	const id = useId();
	const [draft, setDraft] = useState(() => toPickerDate(value, valueFormat));
	const [seen, setSeen] = useState(value);
	if (value !== seen) {
		setSeen(value);
		if (value !== fromPickerDate(draft, valueFormat)) {
			setDraft(toPickerDate(value, valueFormat));
		}
	}

	const handleChange = (next: Date | null) => {
		setDraft(next);
		const published = fromPickerDate(next, valueFormat);
		if (published !== value) {
			onChange(published);
		}
	};

	// The FormFieldLabel above names the field: its sections live in a `group`
	// (labelLink sets `aria-labelledby`), and `for` points at the hidden value
	// input, which hands focus to the first section when the label is clicked.
	const labelHooks = { "data-labelled-control": "", "data-label-target": id } as object;

	return {
		value: draft,
		onChange: handleChange,
		disabled,
		autoFocus,
		name,
		inputRef,
		slots: { openPickerIcon: icon },
		slotProps: {
			textField: {
				id,
				fullWidth,
				// Without a caller error the picker shows its own (an unreadable or half-filled entry).
				error: error || undefined,
				helperText,
				onBlur,
				sx,
				slotProps: { input: labelHooks },
			},
			field: { clearable },
			...STATIC_SLOT_PROPS,
		},
	};
}
