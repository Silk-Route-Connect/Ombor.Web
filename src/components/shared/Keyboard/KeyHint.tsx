import React from "react";

import { Box, Typography } from "@mui/material";

import Kbd from "./Kbd";

interface KeyHintProps {
	/** Keys pressed together («Ctrl» + «Enter»); a single key is a one-item list. */
	keys: React.ReactNode[];
	label: string;
	/** Each key does it on its own («↑» or «↓»): the caps stand side by side, without «+». */
	either?: boolean;
}

/** A shortcut legend entry: the keycaps joined by «+», then what they do. */
export const KeyHint: React.FC<KeyHintProps> = ({ keys, label, either = false }) => (
	<Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
		{keys.map((key, i) => (
			<React.Fragment key={i}>
				{i > 0 && !either && (
					<Box component="span" sx={{ color: "text.disabled", fontSize: 11 }}>
						+
					</Box>
				)}
				<Kbd>{key}</Kbd>
			</React.Fragment>
		))}
		<Typography component="span" sx={{ fontSize: 12, color: "text.secondary", ml: "2px" }}>
			{label}
		</Typography>
	</Box>
);

export default KeyHint;
