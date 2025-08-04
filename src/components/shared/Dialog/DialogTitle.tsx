import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { DialogTitle, IconButton } from "@mui/material";
import { translate as t } from "i18n/i18n";

interface DialogTitleWithCloseProps {
	title: string;
	disabled?: boolean;
	onClose: () => void;
}

const DialogTitleWithClose: React.FC<DialogTitleWithCloseProps> = ({
	title,
	disabled,
	onClose,
}) => (
	<DialogTitle sx={{ m: 0, p: 2 }}>
		{title}
		<IconButton
			aria-label={t("close")}
			onClick={onClose}
			disabled={disabled}
			sx={{ position: "absolute", right: 8, top: 8 }}
		>
			<CloseIcon />
		</IconButton>
	</DialogTitle>
);

export default DialogTitleWithClose;
