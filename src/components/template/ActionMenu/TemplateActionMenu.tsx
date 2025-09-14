import React, { useMemo } from "react";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface TemplateActionMenuProps {
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
}

const TemplateActionMenu: React.FC<TemplateActionMenuProps> = ({ onEdit, onArchive, onDelete }) => {
	const actions: ActionMenuRow[] = useMemo(
		() => [
			{
				key: "edit",
				label: translate("common.edit"),
				icon: <EditIcon fontSize="small" color="warning" />,
				onClick: onEdit,
			},
			{
				key: "archive",
				label: translate("common.archive"),
				icon: <ArchiveIcon fontSize="small" />,
				onClick: onArchive,
			},
			{
				key: "delete",
				label: translate("common.delete"),
				icon: <DeleteIcon fontSize="small" color="error" />,
				onClick: onDelete,
			},
		],
		[onEdit, onArchive, onDelete],
	);

	return <ActionMenu actions={actions} />;
};

export default TemplateActionMenu;
