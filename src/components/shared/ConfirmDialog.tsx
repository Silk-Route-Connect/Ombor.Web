import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { translate } from "i18n/i18n";

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
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}) => {
	return (
		<Dialog open={isOpen} onClose={onCancel} maxWidth="xs" fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>{cancelLabel ?? translate("common.cancel")}</Button>
				<Button onClick={onConfirm} color="error" variant="contained">
					{confirmLabel ?? translate("common.delete")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
