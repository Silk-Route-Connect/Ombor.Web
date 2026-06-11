import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

interface CategoryActionMenuProps {
	onEdit: () => void;
	onDelete: () => void;
}

/**
 * Row actions for a category: edit and delete. Delete is always present (never
 * silently disabled); it surfaces an inline explanation when the category
 * cannot be removed (see CategoryStore.openDelete).
 */
export const CategoryActionMenu: React.FC<CategoryActionMenuProps> = ({ onEdit, onDelete }) => {
	const { t } = useTranslation();

	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditOutlinedIcon fontSize="small" color="warning" />,
			onClick: onEdit,
		},
		{
			key: "delete",
			label: t("common.delete"),
			icon: <DeleteOutlineIcon fontSize="small" color="error" />,
			onClick: onDelete,
		},
	];

	return <ActionMenu actions={actions} />;
};

export default CategoryActionMenu;
