import React from "react";

import type { SxProps, Theme } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material";

export interface FormSectionProps {
	title: string;
	/** An 18px glyph before the title, in the secondary tone. */
	icon?: React.ReactNode;
	/** A control at the right end of the heading line — e.g. the «Фасовка» switch. */
	action?: React.ReactNode;
	/** The section's fields; omit for a heading-only section whose body is toggled by `action`. */
	children?: React.ReactNode;
	sx?: SxProps<Theme>;
}

/**
 * A group of fields inside a long form (product, partner, employee): a top
 * hairline, then a 14/600 heading with an optional icon and right-hand action,
 * then the fields. One look for every in-form section heading — no overlines,
 * no centred rules, no uppercase.
 */
export const FormSection: React.FC<FormSectionProps> = ({ title, icon, action, children, sx }) => (
	<Box
		component="section"
		sx={[
			{ borderTop: "1px solid", borderColor: "divider", pt: "16px" },
			...(Array.isArray(sx) ? sx : [sx]),
		]}
	>
		<Box sx={{ display: "flex", alignItems: "center", gap: "8px", minHeight: 24 }}>
			{icon && (
				<Box
					component="span"
					aria-hidden
					sx={{
						display: "inline-flex",
						color: "text.secondary",
						"& .MuiSvgIcon-root": { fontSize: 18 },
					}}
				>
					{icon}
				</Box>
			)}
			<Typography component="h3" variant="subtitle1" sx={{ color: "text.primary" }}>
				{title}
			</Typography>
			{action && (
				<Box sx={{ ml: "auto", display: "inline-flex", alignItems: "center" }}>{action}</Box>
			)}
		</Box>
		{children && <Stack sx={{ gap: "16px", mt: "14px" }}>{children}</Stack>}
	</Box>
);

export default FormSection;
