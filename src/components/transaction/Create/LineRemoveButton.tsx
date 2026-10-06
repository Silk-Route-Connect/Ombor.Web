import React from "react";
import { controlSize, designTokens } from "theme";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton } from "@mui/material";

import { LINE_CONTROL_OFFSET } from "./posStyles";

interface LineRemoveButtonProps {
	label: string;
	onClick: () => void;
}

/** A line's remove action, level with the line's controls at the row end. */
export const LineRemoveButton: React.FC<LineRemoveButtonProps> = ({ label, onClick }) => (
	<IconButton
		onClick={onClick}
		aria-label={label}
		sx={{
			ml: "auto",
			mt: LINE_CONTROL_OFFSET,
			width: controlSize.md.height,
			height: controlSize.md.height,
			color: designTokens.fg3,
			"& .MuiSvgIcon-root": { fontSize: 20 },
			"&:hover": { color: "error.main", bgcolor: designTokens.errorBg },
		}}
	>
		<DeleteOutlineIcon />
	</IconButton>
);

export default LineRemoveButton;
