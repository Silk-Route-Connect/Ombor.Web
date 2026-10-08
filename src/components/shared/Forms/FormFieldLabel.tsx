import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { designTokens } from "theme";

import { Box, Typography } from "@mui/material";

import { linkLabelToControl } from "./labelLink";

/** The field label: 13px/600 gray-700, sentence case. */
export const fieldLabelSx = {
	fontSize: 13,
	lineHeight: "18px",
	fontWeight: 600,
	color: designTokens.gray700,
} as const;

/**
 * The caption above a control inside a dense line item (qty / price / discount
 * of a line row): 12px/600 secondary, sentence case — never an uppercase
 * micro-label. For a caption that is not a `<label>`, spread it on the text.
 */
export const fieldCaptionSx = {
	fontSize: 12,
	lineHeight: "16px",
	fontWeight: 600,
	color: "text.secondary",
} as const;

export interface FormFieldLabelProps {
	label: string;
	required?: boolean;
	/** Muted suffix, e.g. «необязательно». */
	hint?: string;
	/** The input's id, where the field is not the first control after the label. */
	htmlFor?: string;
	/** `caption` — the smaller label of a field inside a line item (`fieldCaptionSx`). */
	variant?: "field" | "caption";
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
	variant = "field",
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
				...(variant === "caption" ? fieldCaptionSx : fieldLabelSx),
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
