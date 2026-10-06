import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import { Category } from "models/category";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Box } from "@mui/material";

interface CategoryDeleteBlockedDialogProps {
	isOpen: boolean;
	category: Category | null;
	onClose: () => void;
}

/**
 * Shown when a delete is attempted on a category that still has referencing
 * products — the same acknowledgement dialog as the other «нельзя удалить»
 * cases. The delete action is never disabled; this dialog carries the inline
 * explanation instead (CLAUDE.md hard rule 5; business-rules rule 32). The
 * message mirrors the 409 the backend returns for the same case.
 */
const CategoryDeleteBlockedDialog: React.FC<CategoryDeleteBlockedDialogProps> = ({
	isOpen,
	category,
	onClose,
}) => {
	const { t } = useTranslation();

	return (
		<ConfirmDialog
			isOpen={isOpen && category !== null}
			icon={<ErrorOutlineIcon />}
			iconTone="warning"
			title={t("category.delete.blocked.title", { name: category?.name ?? "" })}
			content={
				<>
					<Box component="span" sx={{ color: "text.primary", fontWeight: 600 }}>
						{t("category.delete.blocked.referenced", { count: category?.productCount ?? 0 })}
					</Box>{" "}
					{t("category.delete.blocked.referencedBody")}
				</>
			}
			confirmLabel={t("common.understood")}
			confirmVariant="primary"
			hideCancel
			onConfirm={onClose}
			onCancel={onClose}
		/>
	);
};

export default CategoryDeleteBlockedDialog;
