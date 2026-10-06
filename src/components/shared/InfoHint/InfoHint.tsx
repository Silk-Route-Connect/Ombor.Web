import React from "react";
import { iconSize } from "theme";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Tooltip } from "@mui/material";

interface InfoHintProps {
	/** One plain sentence explaining a term (e.g. WAC, pattern 16) — no formula. */
	text: string;
}

/**
 * The small «i» next to a label or column header whose meaning isn't obvious to
 * a non-technical user (ui-patterns Display conventions → clarity guideline).
 * Click is swallowed so a hint inside a sortable header doesn't re-sort.
 */
const InfoHint: React.FC<InfoHintProps> = ({ text }) => (
	<Tooltip title={text} placement="top" arrow enterTouchDelay={0}>
		<InfoOutlinedIcon
			tabIndex={0}
			aria-label={text}
			onClick={(e) => e.stopPropagation()}
			sx={{
				fontSize: iconSize.xs,
				color: "text.disabled",
				cursor: "help",
				verticalAlign: "middle",
			}}
		/>
	</Tooltip>
);

export default InfoHint;
