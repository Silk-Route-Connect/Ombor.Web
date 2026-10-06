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
 * The primary-entity cell of a row: avatar · name link · «Архив» badge, with an
 * optional secondary line. Archived rows keep their link (text.secondary) and
 * show the badge — no strike-through, no dimming.
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
				{children}
				{archived && <ArchivedBadge />}
			</Box>
			{secondary && (
				<Box sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>{secondary}</Box>
			)}
		</Box>
	</Box>
);

export default EntityCell;
