import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { DialogTitle, IconButton } from "@mui/material";

interface FormDialogHeaderProps {
	title: string;
	disabled: boolean;
	onClose: () => void;
}

const FormDialogHeader: React.FC<FormDialogHeaderProps> = ({ title, disabled, onClose }) => (
	<DialogTitle sx={{ pr: 6 }}>
		{title}
		<IconButton
			aria-label="close"
			onClick={onClose}
			disabled={disabled}
			sx={{ position: "absolute", top: 8, right: 8 }}
		>
			<CloseIcon />
		</IconButton>
	</DialogTitle>
);

export default FormDialogHeader;
