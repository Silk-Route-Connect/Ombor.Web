import React from "react";

import { Dialog } from "@mui/material";

interface FormDialogProps {
	isOpen: boolean;
	isSaving: boolean;
	onClose: () => void;
	children: React.ReactElement;
}

const FormDialog: React.FC<FormDialogProps> = ({ isOpen, isSaving, onClose, children }) => (
	<Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md" disableEscapeKeyDown={isSaving}>
		{children}
	</Dialog>
);

export default FormDialog;
