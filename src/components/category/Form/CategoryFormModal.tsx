import React from "react";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import { recordTile } from "components/shared/IconTile/recordTile";
import { CategoryFormPayload, useCategoryForm } from "hooks/category/useCategoryForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useFormKeyboardSubmit } from "hooks/shared/useFormKeyboardSubmit";
import { Category } from "models/category";

import { Stack, TextField } from "@mui/material";

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
	const onKeyDown = useFormKeyboardSubmit(submit, isSaving);

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		form.formState.isDirty,
		isSaving,
		onClose,
	);

	const {
		register,
		formState: { errors },
	} = form;

	return (
		<FormDialog
			open={isOpen}
			size="sm"
			title={t(category ? "category.title.edit" : "category.title.create")}
			subtitle={category?.name}
			tile={recordTile("Category")}
			busy={isSaving}
			onClose={requestClose}
			onKeyDown={onKeyDown}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
				<FormDialogFooter
					loading={isSaving}
					canSave={canSave}
					onSave={submit}
					onCancel={requestClose}
					submitLabel={category ? undefined : t("category.form.submitCreate")}
				/>
			}
		>
			<Stack sx={{ gap: "16px" }}>
				<FormField label={t("category.form.nameLabel")} required>
					<TextField
						id="category-name"
						placeholder={t("category.form.namePlaceholder")}
						fullWidth
						autoFocus
						disabled={isSaving}
						error={!!errors.name}
						helperText={errors.name?.message}
						{...register("name")}
					/>
				</FormField>

				<FormField label={t("category.form.descriptionLabel")}>
					<TextField
						placeholder={t("category.form.descriptionPlaceholder")}
						fullWidth
						multiline
						minRows={3}
						maxRows={6}
						disabled={isSaving}
						error={!!errors.description}
						helperText={errors.description?.message}
						{...register("description")}
					/>
				</FormField>
			</Stack>
		</FormDialog>
	);
};

export default CategoryFormModal;
