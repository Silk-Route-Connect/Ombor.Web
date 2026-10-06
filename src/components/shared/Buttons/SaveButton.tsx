import React from "react";
import { useTranslation } from "react-i18next";

import CheckIcon from "@mui/icons-material/Check";
import { Box, Button, Tooltip } from "@mui/material";

interface SaveButtonProps {
	disabled?: boolean;
	loading?: boolean;
	fullWidth?: boolean;
	tooltip?: string;
	/** Overrides «Сохранить» — immutable events name what happens («Провести …»). */
	label?: string;
	icon?: React.ReactNode;
	onSave: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({
	disabled = false,
	loading = false,
	fullWidth = false,
	tooltip,
	label,
	icon,
	onSave,
}) => {
	const { t } = useTranslation();

	return (
		<Tooltip title={disabled && !loading && tooltip} placement="top">
			<Box component="span" sx={{ display: "inline-flex", width: fullWidth ? "100%" : "auto" }}>
				<Button
					variant="contained"
					// The commit tick every submit shares (the filled floppy disk was the one
					// filled glyph among outlined icons, and «Провести …» already used ✓).
					startIcon={icon ?? <CheckIcon />}
					color="primary"
					disabled={disabled}
					loading={loading}
					fullWidth={fullWidth}
					onClick={onSave}
					sx={{ whiteSpace: "nowrap" }}
				>
					{label ?? t("common.save")}
				</Button>
			</Box>
		</Tooltip>
	);
};

export default SaveButton;
