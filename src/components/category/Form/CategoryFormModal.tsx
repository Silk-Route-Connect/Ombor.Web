import React from "react";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { CategoryFormPayload, useCategoryForm } from "hooks/category/useCategoryForm";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { translate } from "i18n/i18n";
import { Category } from "models/category";
import { dialogTranslation } from "utils/translationUtils";

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
	const { form, canSave, submit } = useCategoryForm({
		isOpen,
		isSaving,
		category,
		onSave,
		onClose,
	});

	const { discardOpen, requestClose, cancelDiscard, confirmDiscard } = useDirtyClose(
		form.formState.isDirty,
		isSaving,
		onClose,
	);

	const {
		register,
		formState: { errors },
	} = form;

	const title = translate(category ? "category.title.edit" : "category.title.create");

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

				<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 4, pt: 2 }}>
					<TextField
						id="category-name"
						label={translate("category.name")}
						fullWidth
						margin="dense"
						disabled={isSaving}
						error={!!errors.name}
						helperText={errors.name?.message}
						{...register("name")}
					/>

					<TextField
						label={translate("category.description")}
						fullWidth
						multiline
						minRows={3}
						maxRows={6}
						disabled={isSaving}
						error={!!errors.description}
						helperText={errors.description?.message}
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
				title={dialogTranslation("title")}
				content={dialogTranslation("body")}
				confirmLabel={dialogTranslation("confirm")}
				cancelLabel={dialogTranslation("cancel")}
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default CategoryFormModal;
