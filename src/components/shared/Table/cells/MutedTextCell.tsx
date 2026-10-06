import React from "react";

import { Box } from "@mui/material";

import NoValue from "./NoValue";

/**
 * Short secondary data on one line — the author («Создал»), a role, a category.
 * `text.secondary`, never the decoration grey.
 */
export const MutedTextCell: React.FC<{ text: string | null | undefined }> = ({ text }) =>
	text ? (
		<Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
			{text}
		</Box>
	) : (
		<NoValue />
	);

export default MutedTextCell;
