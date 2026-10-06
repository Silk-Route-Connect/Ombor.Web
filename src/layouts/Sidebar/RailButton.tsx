import React, { ElementType } from "react";

import { ListItemButton, Tooltip } from "@mui/material";

import { NAV_ICON, railButtonSx } from "./styles";

interface RailButtonProps {
	label: string;
	icon: ElementType;
	active: boolean;
	onClick: () => void;
}

/** Icon-only rail button (leaf items + footer), with a label tooltip. */
export default function RailButton({
	label,
	icon: Icon,
	active,
	onClick,
}: Readonly<RailButtonProps>) {
	return (
		<Tooltip title={label} placement="right" arrow enterDelay={200}>
			<ListItemButton
				onClick={onClick}
				aria-label={label}
				aria-current={active ? "page" : undefined}
				sx={railButtonSx(active)}
			>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemButton>
		</Tooltip>
	);
}
