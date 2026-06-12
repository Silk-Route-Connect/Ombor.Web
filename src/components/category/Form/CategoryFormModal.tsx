import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { CategoryFormPayload, useCategoryForm } from "hooks/category/useCategoryForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Category } from "models/category";
import { dialogTranslation } from "utils/translationUtils";

import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { Box, Dialog, DialogContent, LinearProgress, TextField } from "@mui/material";

interface CategoryFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	category: Category | null;
	onClose: () => void;
	onSave: (payload: CategoryFormPayload) => void;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
	isOpen,
	isSaving,
	category,
	onClose,
	onSave,
}) => {
	const { t } = useTranslation();
	const { form, canSave, submit } = useCategoryForm({ isOpen, isSaving, category, onSave });

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		form.formState.isDirty,
		isSaving,
		onClose,
	);

	const {
		register,
		formState: { errors },
	} = form;

	const title = t(category ? "category.title.edit" : "category.title.create");

	return (
		<>
			<Dialog
				open={isOpen}
				onClose={requestClose}
				fullWidth
				maxWidth="sm"
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
			>
				<FormDialogHeader title={title} onClose={requestClose} disabled={isSaving} />

				{isSaving && (
					<Box sx={{ position: "relative", height: 4 }}>
						<LinearProgress sx={{ position: "absolute", inset: 0 }} />
					</Box>
				)}

				<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
					<TextField
						id="category-name"
						label={t("category.form.nameLabel")}
						placeholder={t("category.form.namePlaceholder")}
						required
						fullWidth
						autoFocus
						disabled={isSaving}
						error={!!errors.name}
						helperText={errors.name?.message}
						{...register("name")}
					/>

					<TextField
						label={t("category.form.descriptionLabel")}
						placeholder={t("category.form.descriptionPlaceholder")}
						fullWidth
						multiline
						minRows={3}
						maxRows={6}
						disabled={isSaving}
						error={!!errors.description}
						helperText={errors.description?.message ?? t("category.form.descriptionHint")}
						{...register("description")}
					/>
				</DialogContent>

				<FormDialogFooter
					loading={isSaving}
					canSave={canSave}
					onSave={submit}
					onCancel={requestClose}
				/>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default CategoryFormModal;
