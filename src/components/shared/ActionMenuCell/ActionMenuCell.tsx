import React, { useState } from "react";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

interface ActionMenuCellProps {
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
}

export const ActionMenuCell: React.FC<ActionMenuCellProps> = ({ onEdit, onArchive, onDelete }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const open = Boolean(anchorEl);

	const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		setAnchorEl(e.currentTarget);
	};
	const handleClose = () => setAnchorEl(null);

	const handleClick = (action: () => void, e: React.MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		action();
		handleClose();
	};

	return (
		<>
			<IconButton size="medium" onClick={handleOpen} aria-label="actions">
				<MoreVertIcon />
			</IconButton>

			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				onClick={(e) => e.stopPropagation()}
			>
				<MenuItem onClick={(e) => handleClick(onEdit, e)}>
					<ListItemIcon>
						<EditIcon fontSize="small" color="warning" />
					</ListItemIcon>
					<ListItemText primary="Edit" />
				</MenuItem>

				<MenuItem onClick={(e) => handleClick(onArchive, e)}>
					<ListItemIcon>
						<ArchiveIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary="Archive" />
				</MenuItem>

				<MenuItem onClick={(e) => handleClick(onDelete, e)}>
					<ListItemIcon>
						<DeleteIcon fontSize="small" color="error" />
					</ListItemIcon>
					<ListItemText primary="Delete" />
				</MenuItem>
			</Menu>
		</>
	);
};

export default ActionMenuCell;
