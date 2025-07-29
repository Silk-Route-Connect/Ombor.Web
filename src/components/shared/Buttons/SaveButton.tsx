import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import { Button } from "@mui/material";
import { translate } from "i18n/i18n";

interface SaveButtonProps {
	onSave: () => void;
	disabled?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onSave, disabled = false }) => (
	<Button
		variant="contained"
		startIcon={<SaveIcon />}
		color="primary"
		onClick={onSave}
		disabled={disabled}
	>
		{translate("common.save")}
	</Button>
);

export default SaveButton;
