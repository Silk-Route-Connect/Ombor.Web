import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton } from "@mui/material";

import styles from "./ActionCell.module.scss";

interface ActionCellProps {
	onEdit: () => void;
	onDelete: () => void;
}

export const ActionCell: React.FC<ActionCellProps> = ({ onEdit, onDelete }) => {
	const editClicked = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit();
	};

	const deleteClicked = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDelete();
	};

	return (
		<div className={styles.actionCell}>
			<IconButton
				size="medium"
				onClick={editClicked}
				className={styles.iconButton}
				aria-label="edit"
				color="primary"
			>
				<EditIcon fontSize="medium" />
			</IconButton>
			<IconButton
				size="medium"
				onClick={deleteClicked}
				className={styles.iconButton}
				aria-label="delete"
				color="error"
			>
				<DeleteIcon fontSize="medium" />
			</IconButton>
		</div>
	);
};
