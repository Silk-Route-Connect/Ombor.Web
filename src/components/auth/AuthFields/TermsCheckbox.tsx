import React from "react";
import { designTokens, iconSize, radius } from "theme";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Checkbox } from "@mui/material";

interface TermsCheckboxProps {
	checked: boolean;
	error?: boolean;
	onChange: () => void;
	children: React.ReactNode;
}

/** The 18×18 visual box, reused for the checked and unchecked states so the
 *  real <Checkbox> that backs it keeps the bundle's exact look. */
const termsBox = (filled: boolean, error?: boolean) => (
	<Box
		sx={{
			flex: "0 0 auto",
			width: 18,
			height: 18,
			borderRadius: `${radius.xs}px`,
			border: "1.5px solid",
			borderColor: error ? "error.main" : filled ? "primary.main" : designTokens.gray300,
			bgcolor: filled ? "primary.main" : "background.paper",
			color: "common.white",
			display: "grid",
			placeItems: "center",
			transition: "background .12s, border-color .12s",
		}}
	>
		{filled && <CheckIcon sx={{ fontSize: iconSize.xs }} />}
	</Box>
);

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
	checked,
	error,
	onChange,
	children,
}) => (
	<Box
		component="label"
		sx={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}
	>
		{/* A real checkbox input — keyboard-focusable, Space-toggleable, and
		    exposed to screen readers with role/aria-checked. The label above
		    associates the text, so clicking it toggles too. */}
		<Checkbox
			checked={checked}
			onChange={onChange}
			aria-invalid={Boolean(error)}
			disableRipple
			icon={termsBox(false, error)}
			checkedIcon={termsBox(true, error)}
			sx={{
				p: 0,
				mt: "1px",
				"&.Mui-focusVisible": {
					outline: "2px solid",
					outlineColor: "primary.main",
					outlineOffset: "2px",
					borderRadius: `${radius.xs}px`,
				},
			}}
		/>
		<Box sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>{children}</Box>
	</Box>
);

export default TermsCheckbox;
