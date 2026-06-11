import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface TemplateActionMenuProps {
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
}

const TemplateActionMenu: React.FC<TemplateActionMenuProps> = ({ onEdit, onArchive, onDelete }) => {
	const { t } = useTranslation();
	const actions: ActionMenuRow[] = useMemo(
		() => [
			{
				key: "edit",
				label: t("common.edit"),
				icon: <EditIcon fontSize="small" color="warning" />,
				onClick: onEdit,
			},
			{
				key: "archive",
				label: t("common.archive"),
				icon: <ArchiveIcon fontSize="small" />,
				onClick: onArchive,
			},
			{
				key: "delete",
				label: t("common.delete"),
				icon: <DeleteIcon fontSize="small" color="error" />,
				onClick: onDelete,
			},
		],
		[onEdit, onArchive, onDelete, t],
	);

	return <ActionMenu actions={actions} />;
};

export default TemplateActionMenu;
