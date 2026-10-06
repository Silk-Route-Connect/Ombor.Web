import React from "react";
import { useTranslation } from "react-i18next";

import CloseIcon from "@mui/icons-material/Close";
import { Box, DialogTitle, IconButton, Typography } from "@mui/material";

interface FormDialogHeaderProps {
	title: string;
	/** Secondary line under the title (bundle `.fcard-sub`), e.g. the SKU on edit. */
	subtitle?: string;
	disabled: boolean;
	onClose: () => void;
}

const FormDialogHeader: React.FC<FormDialogHeaderProps> = ({
	title,
	subtitle,
	disabled,
	onClose,
}) => {
	const { t } = useTranslation();

	return (
		<DialogTitle sx={{ pr: 6 }}>
			<Box>
				{title}
				{subtitle && (
					<Typography sx={{ fontSize: 13, color: "text.secondary", mt: "3px" }}>
						{subtitle}
					</Typography>
				)}
			</Box>
			<IconButton
				aria-label={t("common.close")}
				onClick={onClose}
				disabled={disabled}
				sx={{ position: "absolute", top: 8, right: 8 }}
			>
				<CloseIcon />
			</IconButton>
		</DialogTitle>
	);
};

export default FormDialogHeader;
