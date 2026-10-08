import React from "react";
import IconTile from "components/shared/IconTile/IconTile";
import { designTokens, radius } from "theme";

import { Box, Paper, Typography } from "@mui/material";

interface Props {
	/** Anchor id used by the sticky nav scroll-spy (rendered as `settings-<id>`). */
	id: string;
	icon: React.ReactNode;
	title: string;
	subtitle?: string;
	/** Right-aligned header action (e.g. «Пригласить пользователя»). */
	action?: React.ReactNode;
	/** The section's save row — a band at the card's foot, the same place in every section. */
	footer?: React.ReactNode;
	/** Makes the card a form, so Enter in a field submits through the footer's submit button. */
	onSubmit?: () => void;
	children: React.ReactNode;
}

/** The 24px side gutter of every settings card — the same as a modal's. */
const GUTTER = "24px";

/**
 * A settings section: a bordered card with a header (tinted icon tile, title,
 * subtitle, optional action), a padded body and an optional footer band that
 * holds the section's own save action.
 */
const SettingsSectionCard: React.FC<Props> = ({
	id,
	icon,
	title,
	subtitle,
	action,
	footer,
	onSubmit,
	children,
}) => (
	<Paper
		id={`settings-${id}`}
		elevation={1}
		{...(onSubmit && {
			component: "form",
			noValidate: true,
			onSubmit: (e: React.FormEvent) => {
				e.preventDefault();
				onSubmit();
			},
		})}
		sx={{
			border: "1px solid",
			borderColor: "divider",
			borderRadius: `${radius.lg}px`,
			overflow: "hidden",
			scrollMarginTop: "16px",
		}}
	>
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: "12px",
				px: GUTTER,
				py: "16px",
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<IconTile icon={icon} token="teal" size={32} />
			<Box sx={{ minWidth: 0 }}>
				<Typography variant="h3" component="h2">
					{title}
				</Typography>
				{subtitle && (
					<Typography variant="caption" component="p" sx={{ color: "text.secondary", mt: "2px" }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			{action && <Box sx={{ ml: "auto", flex: "0 0 auto" }}>{action}</Box>}
		</Box>
		<Box sx={{ px: GUTTER, py: "20px" }}>{children}</Box>
		{footer && (
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					flexWrap: "wrap",
					px: GUTTER,
					py: "12px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.bgSubtle,
				}}
			>
				{footer}
			</Box>
		)}
	</Paper>
);

export default SettingsSectionCard;
