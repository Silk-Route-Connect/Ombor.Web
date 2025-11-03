import React, { useMemo } from "react";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";

interface EmployeeActionMenuProps {
	onEdit: () => void;
	onPayment: () => void;
	onDelete: () => void;
}

const EmployeeActionMenu: React.FC<EmployeeActionMenuProps> = ({ onEdit, onPayment, onDelete }) => {
	const actions: ActionMenuRow[] = useMemo(
		() => [
			{
				key: "payment",
				label: translate("common.payment"),
				icon: <PaymentIcon fontSize="small" color="primary" />,
				onClick: onPayment,
			},
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
		],
		[onDelete, onEdit, onPayment],
	);

	return <ActionMenu actions={actions} />;
};

export default EmployeeActionMenu;
