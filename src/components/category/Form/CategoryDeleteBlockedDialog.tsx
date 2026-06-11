import React from "react";
import { useTranslation } from "react-i18next";
import { Category } from "models/category";

import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";

interface CategoryDeleteBlockedDialogProps {
	isOpen: boolean;
	category: Category | null;
	onClose: () => void;
}

/**
 * Shown when a delete is attempted on a category that cannot be removed — the
 * Default Category, or one that still has referencing products. The delete
 * action is never disabled; this dialog carries the inline explanation instead
 * (CLAUDE.md hard rule 5; business-rules rule 32). The message mirrors the 409
 * ProblemDetails the mock returns for the same case.
 */
const CategoryDeleteBlockedDialog: React.FC<CategoryDeleteBlockedDialogProps> = ({
	isOpen,
	category,
	onClose,
}) => {
	const { t } = useTranslation();

	if (!category) {
		return null;
	}

	const isDefault = category.isDefault;
	const reason = isDefault
		? t("category.delete.blocked.default")
		: t("category.delete.blocked.referenced", { count: category.productCount });
	const body = isDefault
		? t("category.delete.blocked.defaultBody")
		: t("category.delete.blocked.referencedBody");

	return (
		<Dialog open={isOpen} onClose={onClose} maxWidth="xs" fullWidth disableRestoreFocus>
			<DialogTitle>{t("category.delete.blocked.title", { name: category.name })}</DialogTitle>
			<DialogContent>
				<Alert severity="error" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }}>
					{reason}
				</Alert>
				<Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
					{body}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button variant="contained" onClick={onClose}>
					{t("common.understood")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CategoryDeleteBlockedDialog;
