import React from "react";

import type { SxProps, Theme } from "@mui/material";
import { FormHelperText, Stack } from "@mui/material";

import FormFieldLabel, { FormFieldLabelProps } from "./FormFieldLabel";

/** `data-*` attributes for the field's wrapper — e.g. the POS `data-ns` focus-shortcut anchor. */
type DataAttributes = { [key: `data-${string}`]: string | undefined };

export interface FormFieldProps extends FormFieldLabelProps, DataAttributes {
	/** The control (TextField, select, segmented…). */
	children: React.ReactNode;
	/**
	 * A message under a control that has no helper line of its own (a picker, a
	 * select, a segmented control) — e.g. a submit-time «Выберите партнёра».
	 */
	error?: string;
	/** A quiet line under such a control while there is no `error`. */
	helperText?: string;
	sx?: SxProps<Theme>;
}

/**
 * One form field: the `FormFieldLabel` above its control, 6px apart, and an
 * optional message line under it. Every modal and page form lays its fields out
 * with it — `variant="caption"` inside a line item (cart, order, template lines)
 * — so labels never float inside a control and the label-to-control gap is the
 * same everywhere.
 */
export const FormField: React.FC<FormFieldProps> = ({
	children,
	sx,
	error,
	helperText,
	label,
	required,
	hint,
	htmlFor,
	variant,
	...data
}) => {
	const message = error ?? helperText;
	return (
		<Stack {...data} sx={[{ gap: "6px", minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
			<FormFieldLabel
				label={label}
				required={required}
				hint={hint}
				htmlFor={htmlFor}
				variant={variant}
			/>
			{children}
			{message && (
				<FormHelperText error={!!error} sx={{ m: 0 }}>
					{message}
				</FormHelperText>
			)}
		</Stack>
	);
};

export default FormField;
