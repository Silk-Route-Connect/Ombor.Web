import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface PayrollActionMenuProps {
	onEdit: () => void;
	onDelete: () => void;
}

const PayrollActionMenu: React.FC<PayrollActionMenuProps> = ({ onEdit, onDelete }) => {
	const { t } = useTranslation();
	const actions: ActionMenuRow[] = [
		{
			key: "edit",
			label: t("common.edit"),
			icon: <EditIcon fontSize="small" color="warning" />,
			onClick: onEdit,
		},
		{
			key: "delete",
			label: t("common.delete"),
			icon: <DeleteIcon fontSize="small" color="error" />,
			onClick: onDelete,
		},
	];

	return <ActionMenu actions={actions} />;
};

export default PayrollActionMenu;
