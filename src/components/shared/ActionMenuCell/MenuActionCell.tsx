import React, { useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

export interface RowAction {
	key: string;
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
}

interface Props {
	actions: RowAction[];
}

const ActionMenuCell: React.FC<Props> = ({ actions }) => {
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const open = Boolean(anchor);

	const openMenu = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchor(e.currentTarget);
	};
	const closeMenu = () => setAnchor(null);

	const handle = (fn: () => void, e: React.MouseEvent) => {
		e.stopPropagation();
		fn();
		closeMenu();
	};

	return (
		<>
			<IconButton size="medium" onClick={openMenu} aria-label="actions">
				<MoreVertIcon />
			</IconButton>

			<Menu anchorEl={anchor} open={open} onClose={closeMenu} onClick={(e) => e.stopPropagation()}>
				{actions.map((a) => (
					<MenuItem key={a.key} onClick={(e) => handle(a.onClick, e)}>
						<ListItemIcon>{a.icon}</ListItemIcon>
						<ListItemText primary={a.label} />
					</MenuItem>
				))}
			</Menu>
		</>
	);
};

export default ActionMenuCell;
