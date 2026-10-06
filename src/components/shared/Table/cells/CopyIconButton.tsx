import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import CheckIcon from "@mui/icons-material/Check";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import { IconButton, Tooltip } from "@mui/material";

/** Class the owning cell uses to reveal the button on row hover / focus. */
export const COPY_BUTTON_CLASS = "ombor-copy-button";

/**
 * Small copy-to-clipboard icon button. Hidden until its row is hovered or the
 * cell holds focus (the owning cell reveals `COPY_BUTTON_CLASS`); always shown
 * on touch screens. Never lets the click reach the row.
 */
export const CopyIconButton: React.FC<{ value: string | number }> = ({ value }) => {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);

	const copy = async (e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(String(value));
			setCopied(true);
			setTimeout(() => setCopied(false), 1200);
		} catch {
			/* clipboard unavailable — nothing to copy into */
		}
	};

	return (
		<Tooltip title={copied ? t("common.copied") : t("common.copy")} placement="top">
			<IconButton
				size="small"
				className={COPY_BUTTON_CLASS}
				aria-label={t("common.copy")}
				onClick={copy}
				onKeyDown={(e) => e.stopPropagation()}
				sx={{
					p: "3px",
					color: copied ? "success.main" : "text.secondary",
					opacity: copied ? 1 : 0,
					transition: "opacity 120ms",
					"&:focus-visible": { opacity: 1 },
					"@media (hover: none)": { opacity: 1 },
				}}
			>
				{copied ? (
					<CheckIcon sx={{ fontSize: 14 }} />
				) : (
					<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
				)}
			</IconButton>
		</Tooltip>
	);
};

export default CopyIconButton;
