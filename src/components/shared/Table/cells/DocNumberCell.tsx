import React from "react";
import { useTranslation } from "react-i18next";
import DetailLink, { detailLinkSx } from "components/shared/Link/DetailLink";
import { numericSx } from "theme";
import { formatEntityId, hasEntityNumber } from "utils/formatEntityId";

import { Box, Link } from "@mui/material";

import { COPY_BUTTON_CLASS, CopyIconButton } from "./CopyIconButton";

interface DocNumberCellProps {
	/** The served document number (or the id where the document has none — DR-14). */
	number: string | number | null | undefined;
	/** Detail route of the document. */
	to?: string;
	/**
	 * Opens the document in place (a modal detail over the page). With `to` it
	 * takes the plain click and the URL still opens in a new tab.
	 */
	onOpen?: () => void;
}

/**
 * Document number «№N» — the first column of every event table. The number is
 * the link that opens the document; a small copy button appears on row hover /
 * focus. A missing number shows the muted «Без номера» (never an id stand-in).
 */
export const DocNumberCell: React.FC<DocNumberCellProps> = ({ number, to, onOpen }) => {
	const { t } = useTranslation();

	if (!hasEntityNumber(number)) {
		return (
			<Box component="span" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
				{t("common.noNumber")}
			</Box>
		);
	}

	const label = (
		<Box component="span" sx={numericSx}>
			{formatEntityId(number)}
		</Box>
	);

	let content: React.ReactNode = label;
	if (to) {
		content = (
			<DetailLink to={to} onOpen={onOpen}>
				{label}
			</DetailLink>
		);
	} else if (onOpen) {
		content = (
			<Link
				component="button"
				type="button"
				underline="hover"
				onClick={(e: React.MouseEvent) => {
					e.stopPropagation();
					onOpen();
				}}
				onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
				sx={detailLinkSx()}
			>
				{label}
			</Link>
		);
	}

	// The copy button overlays the space after the number (the cell's padding)
	// instead of widening the column — a tight detail tab must still fit at 1366px.
	return (
		<Box
			component="span"
			sx={{
				position: "relative",
				display: "inline-flex",
				alignItems: "center",
				whiteSpace: "nowrap",
				[`& .${COPY_BUTTON_CLASS}`]: {
					position: "absolute",
					left: "100%",
					top: "50%",
					transform: "translateY(-50%)",
					ml: 0.25,
				},
				[`tr:hover & .${COPY_BUTTON_CLASS}, &:focus-within .${COPY_BUTTON_CLASS}`]: { opacity: 1 },
			}}
		>
			{content}
			<CopyIconButton value={number} />
		</Box>
	);
};

export default DocNumberCell;
