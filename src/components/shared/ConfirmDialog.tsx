import { JSX } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	content?: JSX.Element;
	confirmLabel?: string;
	cancelLabel?: string;

	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmDialog = ({
	isOpen: open,
	title,
	content,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	onCancel,
	onConfirm,
}: ConfirmDialogProps) => {
	return (
		<Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
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
