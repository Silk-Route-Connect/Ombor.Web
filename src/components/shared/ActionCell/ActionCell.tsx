import React from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack } from "@mui/material";

interface ActionCellProps {
	onEdit: () => void;
	onDelete: () => void;
}

export const ActionCell: React.FC<ActionCellProps> = ({ onEdit, onDelete }) => {
	const handleEdit = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit();
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete();
	};

	return (
		<Stack direction="row" justifyContent="flex-end" spacing={1}>
			<IconButton size="medium" onClick={handleEdit} aria-label="edit" color="primary">
				<EditIcon fontSize="medium" />
			</IconButton>
			<IconButton size="medium" onClick={handleDelete} aria-label="delete" color="error">
				<DeleteIcon fontSize="medium" />
			</IconButton>
		</Stack>
	);
};
