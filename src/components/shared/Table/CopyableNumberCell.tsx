import React from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { formatEntityId, hasEntityNumber } from "utils/formatEntityId";

import { Box } from "@mui/material";

import { CopyableCell } from "./CopyableCell";

/**
 * Entity-number list cell: shows the served number as «№…» and copies the raw
 * number on click (via {@link CopyableCell}, which swallows the click so the
 * row's open-detail never fires). `muted` is the toned-down variant for rows
 * whose number is secondary (e.g. refunds). A missing number (legacy rows)
 * renders the shared «Без номера» label — never a database-id stand-in, which
 * could collide with a real number.
 */
export const CopyableNumberCell: React.FC<{
	value: string | number | null | undefined;
	muted?: boolean;
}> = ({ value, muted = false }) => {
	const { t } = useTranslation();

	if (!hasEntityNumber(value)) {
		return (
			<Box component="span" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
				{t("common.noNumber")}
			</Box>
		);
	}

	return (
		<CopyableCell
			value={value}
			sx={{ ...numericSx, fontWeight: 700, color: muted ? designTokens.gray700 : "primary.main" }}
		>
			{formatEntityId(value)}
		</CopyableCell>
	);
};

export default CopyableNumberCell;
