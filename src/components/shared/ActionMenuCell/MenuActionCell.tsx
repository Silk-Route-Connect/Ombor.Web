import React, { useState } from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

export interface ActionMenuRow {
	key: string;
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
}

interface ActionMenuProps {
	actions: ActionMenuRow[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({ actions }) => {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const isOpen = Boolean(anchor);

	const openMenu = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchor(e.currentTarget);
	};

	const closeMenu = () => setAnchor(null);

	const handle = (callback: () => void, e: React.MouseEvent) => {
		e.stopPropagation();
		callback();
		closeMenu();
	};

	return (
		<>
			<IconButton size="medium" onClick={openMenu} aria-label="actions">
				<MoreVertIcon />
			</IconButton>

			<Menu
				anchorEl={anchor}
				open={isOpen}
				onClose={closeMenu}
				onClick={(e) => e.stopPropagation()}
			>
				{actions.map((action) => (
					<MenuItem key={action.key} onClick={(e) => handle(action.onClick, e)}>
						<ListItemIcon>{action.icon}</ListItemIcon>
						<ListItemText primary={action.label} />
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default ActionMenu;
