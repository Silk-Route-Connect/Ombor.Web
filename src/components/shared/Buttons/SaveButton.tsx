import React from "react";
import { useTranslation } from "react-i18next";

import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Tooltip } from "@mui/material";

interface SaveButtonProps {
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	tooltip?: string;
	onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({
	disabled = false,
	loading = false,
	fullWidth = false,
	tooltip,
	onSave,
}) => {
	const { t } = useTranslation();

	return (
		<Tooltip title={disabled && !loading && tooltip} placement="top">
			<Box component="span" sx={{ display: "inline-flex", width: fullWidth ? "100%" : "auto" }}>
				<Button
					variant="contained"
					startIcon={<SaveIcon />}
					color="primary"
					disabled={disabled}
					loading={loading}
					fullWidth={fullWidth}
					onClick={onSave}
				>
					{t("common.save")}
				</Button>
			</Box>
		</Tooltip>
	);
};

export default SaveButton;
