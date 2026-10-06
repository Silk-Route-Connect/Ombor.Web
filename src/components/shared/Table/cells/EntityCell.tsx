import React from "react";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";

import { Box } from "@mui/material";

interface EntityCellProps {
	/** The entity's `<XLink>` (pass `archived` to it as well). */
	children: React.ReactNode;
	/** Leading avatar / icon tile. */
	avatar?: React.ReactNode;
	archived?: boolean;
	/** Second line under the name (e.g. the partner's company). */
	secondary?: string | null;
}

/**
 * Clamped lines wrap between words instead of holding one unbreakable line, so
 * on a narrow screen the column shrinks and ellipsizes — it never makes a tall
 * row or pushes the table into sideways scrolling.
 */
const clampSx = (lines: number) =>
	({
		display: "-webkit-box",
		WebkitLineClamp: lines,
		WebkitBoxOrient: "vertical",
		overflow: "hidden",
		minWidth: 0,
	}) as const;

const NAME_SX = clampSx(2);
const SECONDARY_SX = { ...clampSx(1), fontSize: 12, color: "text.secondary" } as const;

/** The full name as a native tooltip — only when the clamp actually cut it. */
const titleWhenClamped = (e: React.MouseEvent<HTMLElement>) => {
	const el = e.currentTarget;
	el.title = el.scrollHeight > el.clientHeight ? (el.textContent ?? "") : "";
};

/**
 * The primary-entity cell of a row: avatar · name link (at most two lines) ·
 * «Архив» badge, with an optional one-line secondary line. Archived rows keep their link
 * (text.secondary) and show the badge — no strike-through, no dimming.
 */
export const EntityCell: React.FC<EntityCellProps> = ({
	children,
	avatar,
	archived,
	secondary,
}) => (
	<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
		{avatar}
		<Box sx={{ minWidth: 0 }}>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
				<Box component="span" sx={NAME_SX} onMouseEnter={titleWhenClamped}>
					{children}
				</Box>
				{archived && <ArchivedBadge />}
			</Box>
			{secondary && (
				<Box sx={SECONDARY_SX} onMouseEnter={titleWhenClamped}>
					{secondary}
				</Box>
			)}
		</Box>
	</Box>
);

export default EntityCell;
