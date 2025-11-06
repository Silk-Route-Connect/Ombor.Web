import React from "react";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface PayrollActionMenuProps {
	onEdit: () => void;
	onDelete: () => void;
}

const PayrollActionMenu: React.FC<PayrollActionMenuProps> = ({ onEdit, onDelete }) => {
	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: translate("common.edit"),
			icon: <EditIcon fontSize="small" color="warning" />,
			onClick: onEdit,
		},
		{
			key: "delete",
			label: translate("common.delete"),
			icon: <DeleteIcon fontSize="small" color="error" />,
			onClick: onDelete,
		},
	];

	return <ActionMenu actions={actions} />;
};

export default PayrollActionMenu;
