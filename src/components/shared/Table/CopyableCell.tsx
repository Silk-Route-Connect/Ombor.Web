import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Box, SxProps, Theme, Tooltip } from "@mui/material";

export interface CopyableCellProps {
	/** Raw value written to the clipboard on click. */
	value: string | number;
	/** Display node; defaults to `String(value)`. */
	children?: React.ReactNode;
	/** Styling merged over the base copy affordance (cursor + hover underline). */
	sx?: SxProps<Theme>;
}

/**
 * Shared click-to-copy text cell — the single copy affordance behind every
 * identifier cell (XC-7 "one text-cell formatter"). It copies the raw `value`,
 * swallows its own clicks (including the mouseup that ends a text selection) so
 * a clickable row's open-detail navigation never fires, shows a copy/copied
 * tooltip and flashes success on copy. Callers own the DISPLAY: pass the text as
 * children and its styling via `sx`. {@link CopyableNumberCell} wraps this for
 * «№…» entity ids; SKU / reference cells use it directly with their own muted
 * mono styling (no «№» prefix).
 */
export const CopyableCell: React.FC<CopyableCellProps> = ({ value, children, sx }) => {
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

	return (
		<Tooltip title={copied ? t("common.copied") : t("common.copy")} placement="top">
			<Box
				component="span"
				onClick={copy}
				sx={{
					cursor: "copy",
					"&:hover": { textDecoration: "underline" },
					...sx,
					// The copied flash must win over the caller's resting color.
					...(copied ? { color: "success.main" } : null),
				}}
			>
				{children ?? String(value)}
			</Box>
		</Tooltip>
	);
};

export default CopyableCell;
