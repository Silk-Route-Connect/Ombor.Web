import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import SaveButton from "components/shared/Buttons/SaveButton";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { designTokens } from "theme";

import { Box, DialogActions } from "@mui/material";

import CommitNote from "./CommitNote";

interface FormDialogFooterProps {
	/** Submission allowed — false only while a save is in flight (hard rule 5). */
	canSave: boolean;
	loading: boolean;
	onCancel: () => void;
	onSave: () => void;
	/** Submit text; defaults to «Сохранить». Immutable events say what happens. */
	submitLabel?: string;
	submitIcon?: React.ReactNode;
	/** Overrides «Отмена» — e.g. «Назад» on the second step of a two-step commit. */
	cancelLabel?: string;
	/** Consequence + correction line under the submit (immutable events only). */
	commitNote?: string;
	/** Left-hand slot — e.g. a positions / total counter. */
	summary?: React.ReactNode;
}

/**
 * Dialog footer per the design system's `.fcard-foot`: surface-sub strip with
 * a top hairline; optional summary left, ghost «Отмена» + primary submit right,
 * and for immutable events one `CommitNote` line under the buttons. The submit
 * stays enabled (validation runs on submit, rule 5); it is disabled only while a
 * save is in flight or while the backend is unreachable (F-028).
 */
const FormDialogFooter: React.FC<FormDialogFooterProps> = observer(
	({
		canSave,
		loading,
		onCancel,
		onSave,
		submitLabel,
		submitIcon,
		cancelLabel,
		commitNote,
		summary,
	}) => {
		const { t } = useTranslation();
		const { connectivityStore } = useStore();
		const offline = connectivityStore.isBackendDown;

		return (
			<DialogActions
				disableSpacing
				sx={{
					px: "24px",
					py: "14px",
					flexDirection: "column",
					alignItems: "stretch",
					gap: "8px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
					{summary}
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={onCancel} disabled={loading}>
						{cancelLabel ?? t("common.cancel")}
					</GhostButton>
					<SaveButton
						disabled={!canSave || offline}
						loading={loading}
						tooltip={offline ? t("common.offline.saveTooltip") : undefined}
						label={submitLabel}
						icon={submitIcon}
						onSave={onSave}
					/>
				</Box>
				{commitNote && <CommitNote text={commitNote} sx={{ justifyContent: "flex-end" }} />}
			</DialogActions>
		);
	},
);

export default FormDialogFooter;
