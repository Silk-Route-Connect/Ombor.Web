import React from "react";
import { useTranslation } from "react-i18next";
import SaveButton from "components/shared/Buttons/SaveButton";

import { Button, DialogActions } from "@mui/material";

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
}) => {
	const { t } = useTranslation();

	return (
		<DialogActions sx={{ p: 2 }}>
			<Button onClick={onCancel} disabled={loading}>
				{t("common.cancel")}
			</Button>
			<SaveButton
				disabled={!canSave}
				loading={loading}
				tooltip={!canSave ? t("common.form.completeRequired") : undefined}
				onSave={onSave}
			/>
		</DialogActions>
	);
};

export default FormDialogFooter;
