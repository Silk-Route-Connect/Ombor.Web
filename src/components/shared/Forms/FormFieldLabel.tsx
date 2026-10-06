import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { designTokens } from "theme";

import { Box, Typography } from "@mui/material";

import { linkLabelToControl } from "./labelLink";

export interface FormFieldLabelProps {
	label: string;
	required?: boolean;
	/** Muted suffix, e.g. «необязательно». */
	hint?: string;
	/** The input's id, where the field is not the first control after the label. */
	htmlFor?: string;
}

/**
 * Field label above an input per the design system's `.flabel`: 13px/600
 * gray-700, with the required mark as an error-colored asterisk. Without
 * `htmlFor` it names the first control after it in its container, so every form
 * field has an accessible name without each form wiring ids; it re-links when
 * that container's content changes (a field mounting later, a line added).
 */
export const FormFieldLabel: React.FC<FormFieldLabelProps> = ({
	label,
	required,
	hint,
	htmlFor,
}) => {
	const labelId = useId();
	const ref = useRef<HTMLLabelElement>(null);
	const [linkedFor, setLinkedFor] = useState<string | undefined>(undefined);

	useLayoutEffect(() => {
		const element = ref.current;
		const scope = element?.parentElement;
		if (htmlFor || !element || !scope) {
			return;
		}
		const link = () => setLinkedFor(linkLabelToControl(element));
		link();
		const observer = new MutationObserver(link);
		observer.observe(scope, { childList: true, subtree: true });
		return () => observer.disconnect();
	}, [htmlFor]);

	return (
		<Typography
			ref={ref}
			component="label"
			id={labelId}
			htmlFor={htmlFor ?? linkedFor}
			data-field-label=""
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				fontSize: 13,
				fontWeight: 600,
				color: designTokens.gray700,
			}}
		>
			{label}
			{required && (
				<Box component="span" sx={{ color: "error.main" }}>
					*
				</Box>
			)}
			{hint && (
				<Box component="span" sx={{ fontWeight: 500, color: "text.disabled" }}>
					{hint}
				</Box>
			)}
		</Typography>
	);
};

export default FormFieldLabel;
