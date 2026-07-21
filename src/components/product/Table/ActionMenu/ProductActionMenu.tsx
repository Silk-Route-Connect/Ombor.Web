import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { Product } from "models/product";
import { designTokens } from "theme";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface ProductActionMenuProps {
	product: Product;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
}

/**
 * Row actions for a product: edit, plus archive or restore depending on state.
 * Products are archive-only — never hard-deleted (canon rules 17/22/32).
 * Colors per the bundle's rmenu: edit is neutral (ink label, muted icon);
 * archive is the saffron-tinted action; restore is the success-tinted action.
 */
export const ProductActionMenu: React.FC<ProductActionMenuProps> = ({
	product,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />,
			onClick: onEdit,
		},
		product.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					labelColor: "success.main",
					dividerBefore: true,
					icon: <UnarchiveOutlinedIcon fontSize="small" sx={{ color: "success.main" }} />,
					onClick: onRestore,
				}
			: {
					key: "archive",
					label: t("common.archive"),
					labelColor: designTokens.saffron700,
					dividerBefore: true,
					icon: <ArchiveOutlinedIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />,
					onClick: onArchive,
				},
	];

	return <ActionMenu actions={actions} />;
};

export default ProductActionMenu;
