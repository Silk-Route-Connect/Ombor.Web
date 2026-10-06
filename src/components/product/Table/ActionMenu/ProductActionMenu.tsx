import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { TFunction } from "i18next";
import { Product } from "models/product";

import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

interface ProductActionHandlers {
	product: Product;
	onEdit: () => void;
	onArchive: () => void;
	onRestore: () => void;
	onDelete: () => void;
}

/**
 * The product action rows — edit, archive-or-restore, delete — shared by the
 * list row menu and the detail-page kebab. Delete is always offered; a
 * referenced product gets «cannot delete — archive instead» (pattern 19).
 */
export function buildProductActionRows(
	t: TFunction,
	{ product, onEdit, onArchive, onRestore, onDelete }: ProductActionHandlers,
): ActionMenuRow[] {
	return [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" />,
			onClick: onEdit,
		},
		product.isArchived
			? {
					key: "restore",
					label: t("common.restore"),
					tone: "restore",
					dividerBefore: true,
					icon: <UnarchiveOutlinedIcon fontSize="small" />,
					onClick: onRestore,
				}
			: {
					key: "archive",
					label: t("common.archive"),
					tone: "archive",
					dividerBefore: true,
					icon: <ArchiveOutlinedIcon fontSize="small" />,
					onClick: onArchive,
				},
		{
			key: "delete",
			label: t("common.delete"),
			tone: "danger",
			dividerBefore: true,
			icon: <DeleteOutlineIcon fontSize="small" />,
			onClick: onDelete,
		},
	];
}

/** Row actions for a product on the shared {@link ActionMenu}. */
export const ProductActionMenu: React.FC<ProductActionHandlers> = (handlers) => {
	const { t } = useTranslation();
	return <ActionMenu actions={buildProductActionRows(t, handlers)} />;
};

export default ProductActionMenu;
