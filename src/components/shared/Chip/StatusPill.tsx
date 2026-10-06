import React from "react";
import { ChipTokenKey, chipTokens, radius } from "theme";

import { Box, SvgIconProps } from "@mui/material";

export type StatusPillSize = "sm" | "md";

interface StatusPillProps {
	/** Colour semantics — a `chipTokens` key; never an inline colour. */
	token: ChipTokenKey;
	label: React.ReactNode;
	icon?: React.ComponentType<SvgIconProps>;
	/** `sm` (default) for table cells and cards; `md` for detail headers / hero cards. */
	size?: StatusPillSize;
	/** Struck-through label (e.g. a cancelled order). */
	strike?: boolean;
	/** Small-caps treatment for meta badges such as «Архив». */
	uppercase?: boolean;
}

const GEOMETRY: Record<
	StatusPillSize,
	{ height: number; px: number; iconPx: number; fontSize: number; icon: number }
> = {
	sm: { height: 22, px: 10, iconPx: 8, fontSize: 12, icon: 14 },
	md: { height: 26, px: 12, iconPx: 10, fontSize: 13, icon: 16 },
};

/**
 * The one pill primitive for status / type / direction chips. Fixed geometry per
 * size, colours only from `chipTokens`. Semantic wrappers (PaymentStatusChip,
 * MovementKindChip, TransactionTypeBadge, …) choose the token, icon and label.
 */
export const StatusPill: React.FC<StatusPillProps> = ({
	token,
	label,
	icon: Icon,
	size = "sm",
	strike,
	uppercase,
}) => {
	const tk = chipTokens[token];
	const g = GEOMETRY[size];

	return (
		<Box
			component="span"
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "4px",
				flexShrink: 0,
				height: g.height,
				pl: `${Icon ? g.iconPx : g.px}px`,
				pr: `${g.px}px`,
				borderRadius: `${radius.pill}px`,
				fontSize: uppercase ? 11 : g.fontSize,
				fontWeight: 600,
				lineHeight: 1,
				letterSpacing: uppercase ? "0.04em" : undefined,
				textTransform: uppercase ? "uppercase" : undefined,
				textDecoration: strike ? "line-through" : undefined,
				whiteSpace: "nowrap",
				verticalAlign: "middle",
				border: "1px solid",
				bgcolor: tk.bg,
				color: tk.color,
				borderColor: tk.border,
			}}
		>
			{Icon && <Icon sx={{ fontSize: g.icon }} />}
			{label}
		</Box>
	);
};

export default StatusPill;
