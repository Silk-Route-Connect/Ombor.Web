import React from "react";
import { useTranslation } from "react-i18next";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";

import { Box, FormHelperText } from "@mui/material";

interface PosFieldProps {
	label: string;
	required?: boolean;
	/** Marks the field «необязательно» in the label. */
	optional?: boolean;
	/** Shown under the control after a submit attempt. */
	error?: string;
	/** A quiet line under the control while there is no error. */
	hint?: string;
	/** `data-ns` anchor for the page's Alt+key focus shortcuts. */
	ns?: string;
	children: React.ReactNode;
}

/**
 * One field of a POS / New Order header card: the shared `FormFieldLabel` (which
 * names the control below it), the control, and one message line — the error
 * after a submit attempt, otherwise an optional hint — in the theme's helper text.
 */
export const PosField: React.FC<PosFieldProps> = ({
	label,
	required,
	optional,
	error,
	hint,
	ns,
	children,
}) => {
	const { t } = useTranslation();
	const message = error ?? hint;

	return (
		<Box data-ns={ns} sx={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
			<FormFieldLabel
				label={label}
				required={required}
				hint={optional ? t("common.optional") : undefined}
			/>
			{children}
			{message && (
				<FormHelperText error={!!error} sx={{ m: 0 }}>
					{message}
				</FormHelperText>
			)}
		</Box>
	);
};

export default PosField;
