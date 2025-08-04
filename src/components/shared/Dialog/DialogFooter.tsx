import React from "react";
import { Button, DialogActions } from "@mui/material";
import SaveButton from "components/shared/Buttons/SaveButton";
import { translate } from "i18n/i18n";

interface DialogFooterWithSaveProps {
	canSave: boolean;
	loading: boolean;
	onCancel: () => void;
	onSave: () => void;
}

const DialogFooterWithSave: React.FC<DialogFooterWithSaveProps> = ({
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
			tooltip={translate("common.form.completeRequired")}
			onSave={onSave}
		/>
	</DialogActions>
);

export default DialogFooterWithSave;
