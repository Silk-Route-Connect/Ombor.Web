import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { designTokens } from "theme";

import { DialogActions } from "@mui/material";

interface FormDialogFooterProps {
	canSave: boolean;
	loading: boolean;
	onCancel: () => void;
	onSave: () => void;
}

/**
 * Dialog footer per the design system's `.fcard-foot`: surface-sub strip with
 * a top hairline; ghost «Отмена» + primary save, right-aligned.
 */
const FormDialogFooter: React.FC<FormDialogFooterProps> = ({
	canSave,
	loading,
	onCancel,
	onSave,
}) => {
	const { t } = useTranslation();

	return (
		<DialogActions
			sx={{
				px: "24px",
				py: "14px",
				gap: "10px",
				borderTop: "1px solid",
				borderColor: "divider",
				bgcolor: designTokens.gray25,
			}}
		>
			<GhostButton onClick={onCancel} disabled={loading}>
				{t("common.cancel")}
			</GhostButton>
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
