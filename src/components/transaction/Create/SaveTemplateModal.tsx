import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";

import { TextField } from "@mui/material";

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
		<FormDialog
			open={isOpen}
			size="sm"
			title={t("transaction.new.tpl.title")}
			subtitle={t("transaction.new.tpl.subtitle")}
			tile={recordTile("Template")}
			busy={isSaving}
			onClose={handleClose}
			footer={
				<FormDialogFooter
					canSave={!isSaving}
					loading={isSaving}
					onCancel={handleClose}
					onSave={handleSave}
					submitLabel={t("transaction.new.tpl.save")}
				/>
			}
		>
			<FormField label={t("transaction.new.tpl.nameLabel")} required>
				<TextField
					autoFocus
					fullWidth
					placeholder={t("transaction.new.tpl.namePlaceholder")}
					value={name}
					onChange={(e) => setName(e.target.value)}
					error={nameError}
					helperText={nameError ? t("transaction.new.tpl.nameRequired") : undefined}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSave();
						}
					}}
				/>
			</FormField>
		</FormDialog>
	);
};

export default SaveTemplateModal;
