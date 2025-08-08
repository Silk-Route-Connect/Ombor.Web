import React from "react";
import { Button, DialogActions } from "@mui/material";
import SaveButton from "components/shared/Buttons/SaveButton";
import { translate } from "i18n/i18n";

interface FormDialogFooterProps {
	canSave: boolean;
	loading: boolean;
	onCancel: () => void;
	onSave: () => void;
}

const FormDialogFooter: React.FC<FormDialogFooterProps> = ({
	canSave,
	loading,
	onCancel,
	onSave,
}) => (
	<DialogActions sx={{ p: 2 }}>
		<Button onClick={onCancel} disabled={loading}>
			{translate("common.cancel")}
		</Button>
		<SaveButton
			disabled={!canSave}
			loading={loading}
			tooltip={!canSave ? translate("common.form.completeRequired") : undefined}
			onSave={onSave}
		/>
	</DialogActions>
);

export default FormDialogFooter;
