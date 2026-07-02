import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { numericSx } from "theme";
import { formatEntityId } from "utils/formatEntityId";

import { Box, Tooltip } from "@mui/material";

/**
 * Order-number cell: shows the served number as «№…» and copies the raw number
 * on click. It swallows its clicks (including the mouseup that ends a text
 * selection) so interacting with the number never triggers the row's
 * open-detail navigation — the rest of the row stays clickable.
 */
export const OrderNumberCell: React.FC<{ orderNumber: string }> = ({ orderNumber }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const copy = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(orderNumber);
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			/* clipboard unavailable — no-op */
		}
	};

	return (
		<Tooltip title={copied ? t("common.copied") : t("common.copy")} placement="top">
			<Box
				component="span"
				onClick={copy}
				sx={{
					...numericSx,
					fontWeight: 700,
					color: copied ? "success.main" : "primary.main",
					cursor: "copy",
					"&:hover": { textDecoration: "underline" },
				}}
			>
				{formatEntityId(orderNumber)}
			</Box>
		</Tooltip>
	);
};

export default OrderNumberCell;
