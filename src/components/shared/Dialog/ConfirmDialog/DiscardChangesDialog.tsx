import React from "react";
import { useTranslation } from "react-i18next";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";

import ConfirmDialog from "./ConfirmDialog";

export interface DiscardChangesDialogProps {
	open: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * «Закрыть форму?» — asked when a dirty form is closed (`useDirtyClose`). One
 * component so every modal asks the same question with the same warning tile.
 */
const DiscardChangesDialog: React.FC<DiscardChangesDialogProps> = ({
	open,
	onConfirm,
	onCancel,
}) => {
	const { t } = useTranslation();
	return (
		<ConfirmDialog
			isOpen={open}
			icon={<ReportProblemOutlinedIcon />}
			iconTone="warning"
			title={t("common.dialog.discardChanges.title")}
			content={t("common.dialog.discardChanges.body")}
			confirmLabel={t("common.dialog.discardChanges.confirm")}
			cancelLabel={t("common.dialog.discardChanges.cancel")}
			confirmVariant="danger"
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	);
};

export default DiscardChangesDialog;
