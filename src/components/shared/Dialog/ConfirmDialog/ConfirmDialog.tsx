import React from "react";
import { useTranslation } from "react-i18next";

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
	confirmLabel,
	cancelLabel,
	onConfirm,
	onCancel,
}) => {
	const { t } = useTranslation();

	return (
		<Dialog
			open={isOpen}
			onClose={onCancel}
			maxWidth="xs"
			fullWidth
			disableRestoreFocus
			disableEscapeKeyDown
		>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>{content}</DialogContent>
			<DialogActions>
				<Button onClick={onCancel}>{cancelLabel ?? t("common.cancel")}</Button>
				<Button onClick={onConfirm} color="error" variant="contained">
					{confirmLabel ?? t("common.delete")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
