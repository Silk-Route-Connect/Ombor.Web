import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";

import { DialogActions } from "@mui/material";

interface FormDialogFooterProps {
	/** Submission allowed — false only while a save is in flight (hard rule 5). */
	canSave: boolean;
	loading: boolean;
	onCancel: () => void;
	onSave: () => void;
}

/**
 * Dialog footer per the design system's `.fcard-foot`: surface-sub strip with
 * a top hairline; ghost «Отмена» + primary save, right-aligned. The save button
 * stays enabled (validation runs on submit, rule 5); it is disabled only while a
 * save is in flight or while the backend is unreachable (F-028).
 */
const FormDialogFooter: React.FC<FormDialogFooterProps> = observer(
	({ canSave, loading, onCancel, onSave }) => {
		const { t } = useTranslation();
		const { connectivityStore } = useStore();
		const offline = connectivityStore.isBackendDown;

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
					disabled={!canSave || offline}
					loading={loading}
					tooltip={offline ? t("common.offline.saveTooltip") : undefined}
					onSave={onSave}
				/>
			</DialogActions>
		);
	},
);

export default FormDialogFooter;
