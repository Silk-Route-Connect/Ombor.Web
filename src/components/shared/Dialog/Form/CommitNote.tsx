import React from "react";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, SxProps, Theme } from "@mui/material";

interface CommitNoteProps {
	/** One short line: the consequence + how a mistake is corrected. */
	text: string;
	sx?: SxProps<Theme>;
}

/**
 * The single line under the commit button of an immutable event (sale, supply,
 * refund, payment, payroll, stock adjustment, transfer, opening stock): what the
 * click makes permanent and how a mistake is corrected. Commit convention —
 * ui-patterns Display conventions.
 */
const CommitNote: React.FC<CommitNoteProps> = ({ text, sx }) => (
	<Box
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "6px",
			fontSize: 12,
			lineHeight: 1.4,
			color: "text.secondary",
			...sx,
		}}
	>
		<LockOutlinedIcon sx={{ fontSize: 14, flex: "0 0 auto" }} />
		<Box component="span">{text}</Box>
	</Box>
);

export default CommitNote;
