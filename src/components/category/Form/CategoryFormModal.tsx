import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	LinearProgress,
	TextField,
} from "@mui/material";
import { CategoryFormPayload, useCategoryForm } from "hooks/category/useCategoryForm";
import { translate } from "i18n/i18n";
import { Category } from "models/category";

interface CategoryFormModalProps {
	isOpen: boolean;
	isSaving: boolean;
	category?: Category | null;
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
	const {
		register,
		handleSubmit,
		formState: { errors, isDirty, isValid },
	} = useCategoryForm(isOpen, category);

	const submit = handleSubmit(onSave);

	const safeClose = () => {
		if (isSaving) return;

		if (isDirty) {
			const confirm = window.confirm(translate("common.confirmDiscardChanges"));
			if (!confirm) return;
		}
		onClose();
	};

	const title = translate(category ? "category.title.edit" : "category.title.create");
	const canSave = isDirty && isValid && !isSaving;

	return (
		<Dialog
			open={isOpen}
			onClose={safeClose}
			fullWidth
			maxWidth="sm"
			disableEscapeKeyDown={isSaving}
			disableRestoreFocus
		>
			<DialogTitle sx={{ m: 0, p: 2 }}>
				{title}
				<IconButton
					onClick={safeClose}
					disabled={isSaving}
					sx={{ position: "absolute", right: 8, top: 8 }}
					aria-label="close"
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			{isSaving && <LinearProgress />}

			<DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
				<TextField
					label={translate("category.name")}
					fullWidth
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

			<DialogActions sx={{ p: 2 }}>
				<Button onClick={safeClose} disabled={isSaving}>
					{translate("common.cancel")}
				</Button>
				<Button variant="contained" loading={isSaving} onClick={submit} disabled={!canSave}>
					{translate("common.save")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CategoryFormModal;
