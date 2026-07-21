import React, { useLayoutEffect, useRef, useState } from "react";

import { Box, SxProps, Theme, Tooltip } from "@mui/material";

interface TruncatedTextProps {
	/** The full text; shown in a tooltip only when it actually overflows. */
	text: string;
	/** Cap past which genuinely long values truncate (px or any CSS length). */
	maxWidth?: number | string;
	/** Extra styling for the text itself (weight, colour, flex behaviour…). */
	sx?: SxProps<Theme>;
}

/**
 * Reusable table-cell truncation pattern: single-line ellipsis at `maxWidth`,
 * with a tooltip revealing the full text — but only when the text is actually
 * clipped (no redundant tooltip on short values). Adopt this for any list-table
 * cell that can hold a genuinely long free-text value (names, descriptions).
 */
const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxWidth = 280, sx }) => {
	const ref = useRef<HTMLElement>(null);
	const [overflowing, setOverflowing] = useState(false);

	useLayoutEffect(() => {
		const el = ref.current;
		if (el) {
			setOverflowing(el.scrollWidth > el.clientWidth);
		}
	}, [text, maxWidth]);

	const content = (
		<Box
			ref={ref}
			component="span"
			sx={{
				display: "block",
				maxWidth,
				overflow: "hidden",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				...sx,
			}}
		>
			{text}
		</Box>
	);

	return overflowing ? (
		<Tooltip title={text} enterDelay={400} placement="top-start">
			{content}
		</Tooltip>
	) : (
		content
	);
};

export default TruncatedText;
