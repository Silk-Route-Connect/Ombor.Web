import React from "react";
import { designTokens, numericSx } from "theme";
import { formatEntityId } from "utils/formatEntityId";

import { CopyableCell } from "./CopyableCell";

/**
 * Entity-number list cell: shows the served number as «№…» and copies the raw
 * number on click (via {@link CopyableCell}, which swallows the click so the
 * row's open-detail never fires). `muted` is the toned-down variant for rows
 * whose number is secondary (e.g. refunds).
 */
export const CopyableNumberCell: React.FC<{ value: string | number; muted?: boolean }> = ({
	value,
	muted = false,
}) => (
	<CopyableCell
		value={value}
		sx={{ ...numericSx, fontWeight: 700, color: muted ? designTokens.gray700 : "primary.main" }}
	>
		{formatEntityId(value)}
	</CopyableCell>
);

export default CopyableNumberCell;
