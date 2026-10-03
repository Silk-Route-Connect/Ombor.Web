import React from "react";

import TruncatedText from "../TruncatedText";
import NoValue from "./NoValue";

/**
 * Free text (notes, descriptions): one secondary line, ellipsis + tooltip when
 * clipped. Notes columns are never sortable.
 */
export const NotesCell: React.FC<{ text: string | null | undefined; maxWidth?: number }> = ({
	text,
	maxWidth = 280,
}) =>
	text ? (
		<TruncatedText text={text} maxWidth={maxWidth} sx={{ color: "text.secondary" }} />
	) : (
		<NoValue />
	);

export default NotesCell;
