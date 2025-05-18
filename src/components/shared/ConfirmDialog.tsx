import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	content?: React.ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	content,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	onConfirm,
	onCancel,
}) => {
	return (
		<Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>{cancelLabel}</Button>
				<Button onClick={onConfirm} color="error" variant="contained">
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
