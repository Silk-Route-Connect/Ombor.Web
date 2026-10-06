import React from "react";

import type { SxProps, Theme } from "@mui/material";
import { Stack } from "@mui/material";

import FormFieldLabel, { FormFieldLabelProps } from "./FormFieldLabel";

export interface FormFieldProps extends FormFieldLabelProps {
	/** The control (TextField, select, segmented…) with its own helper / error line. */
	children: React.ReactNode;
	sx?: SxProps<Theme>;
}

/**
 * One form field: the `FormFieldLabel` above its control, 6px apart. Every
 * modal and page form lays its fields out with it, so labels never float inside
 * a control and the label-to-control gap is the same everywhere.
 */
export const FormField: React.FC<FormFieldProps> = ({ children, sx, ...label }) => (
	<Stack sx={[{ gap: "6px", minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
		<FormFieldLabel {...label} />
		{children}
	</Stack>
);

export default FormField;
