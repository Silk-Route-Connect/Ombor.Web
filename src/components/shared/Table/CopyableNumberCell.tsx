import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { designTokens, numericSx } from "theme";
import { formatEntityId } from "utils/formatEntityId";

import { Box, Tooltip } from "@mui/material";

/**
 * Entity-number list cell: shows the served number as «№…» and copies the raw
 * number on click. It swallows its clicks (including the mouseup that ends a
 * text selection) so interacting with the number never triggers the row's
 * open-detail navigation — the rest of the row stays clickable. `muted` is the
 * toned-down variant for rows whose number is secondary (e.g. refunds).
 */
export const CopyableNumberCell: React.FC<{ value: string | number; muted?: boolean }> = ({
	value,
	muted = false,
}) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const copy = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(String(value));
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			/* clipboard unavailable — no-op */
		}
	};

	const restingColor = muted ? designTokens.gray700 : "primary.main";

	return (
		<Tooltip title={copied ? t("common.copied") : t("common.copy")} placement="top">
			<Box
				component="span"
				onClick={copy}
				sx={{
					...numericSx,
					fontWeight: 700,
					color: copied ? "success.main" : restingColor,
					cursor: "copy",
					"&:hover": { textDecoration: "underline" },
				}}
			>
				{formatEntityId(value)}
			</Box>
		</Tooltip>
	);
};

export default CopyableNumberCell;
