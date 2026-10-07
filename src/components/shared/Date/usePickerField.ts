import React, { useId, useImperativeHandle, useState } from "react";
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
	/** react-hook-form's `field.ref`, so a submit error can focus the field (its first section). */
	inputRef?: React.Ref<{ focus: () => void }>;
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
 * default, a day capped by the page), or when the user leaves a field whose
 * entry the form did not take.
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

	const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
		onBlur?.();
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget.contains(next)) {
			return;
		}
		// A caller may keep its own day instead of the entry (the Акт сверки ignores a
		// half-typed day and caps a future one): once the user leaves the field it shows
		// the day the page uses again, as the native input did.
		if (fromPickerDate(draft, valueFormat) !== value) {
			setDraft(toPickerDate(value, valueFormat));
		}
	};

	// A form focuses its first invalid field on submit. Focused from code, MUI's hidden
	// value input keeps the focus without a section to type into, so the form gets the
	// first section instead.
	useImperativeHandle(
		inputRef,
		() => ({
			focus: () =>
				document
					.getElementById(id)
					?.parentElement?.querySelector<HTMLElement>("[role=spinbutton]")
					?.focus(),
		}),
		[id],
	);

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
		slots: { openPickerIcon: icon },
		slotProps: {
			textField: {
				id,
				fullWidth,
				// Without a caller error the picker shows its own (an unreadable or half-filled entry).
				error: error || undefined,
				helperText,
				onBlur: handleBlur,
				sx,
				slotProps: { input: labelHooks },
			},
			field: { clearable },
			...STATIC_SLOT_PROPS,
		},
	};
}
