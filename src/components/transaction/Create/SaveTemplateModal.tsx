import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";

import CheckIcon from "@mui/icons-material/Check";
import { Dialog, DialogActions, DialogContent, TextField } from "@mui/material";

interface SaveTemplateModalProps {
	isOpen: boolean;
	isSaving: boolean;
	onClose: () => void;
	onSave: (name: string) => void;
}

/** «Сохранить как шаблон» — names the current cart + partner as a reusable Sale template. */
export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
	isOpen,
	isSaving,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [tried, setTried] = useState(false);

	const handleClose = () => {
		setName("");
		setTried(false);
		onClose();
	};

	const handleSave = () => {
		setTried(true);
		if (!name.trim()) {
			return;
		}
		onSave(name.trim());
		setName("");
		setTried(false);
	};

	const nameError = tried && !name.trim();

	return (
		<Dialog
			open={isOpen}
			onClose={handleClose}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 460, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("transaction.new.tpl.title")}
				subtitle={t("transaction.new.tpl.subtitle")}
				disabled={isSaving}
				onClose={handleClose}
			/>
			<DialogContent dividers>
				<TextField
					autoFocus
					fullWidth
					label={t("transaction.new.tpl.nameLabel")}
					placeholder={t("transaction.new.tpl.namePlaceholder")}
					value={name}
					onChange={(e) => setName(e.target.value)}
					error={nameError}
					helperText={nameError ? t("transaction.new.tpl.nameRequired") : " "}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSave();
						}
					}}
				/>
			</DialogContent>
			<DialogActions sx={{ px: "24px", py: "14px", gap: "10px" }}>
				<GhostButton onClick={handleClose} disabled={isSaving}>
					{t("transaction.new.tpl.cancel")}
				</GhostButton>
				<PrimaryButton icon={<CheckIcon />} onClick={handleSave} disabled={isSaving}>
					{t("transaction.new.tpl.save")}
				</PrimaryButton>
			</DialogActions>
		</Dialog>
	);
};

export default SaveTemplateModal;
