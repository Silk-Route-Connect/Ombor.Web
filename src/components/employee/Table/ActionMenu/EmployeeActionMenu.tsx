import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";

interface EmployeeActionMenuProps {
	onEdit: () => void;
	onPayment: () => void;
	onDelete: () => void;
}

const EmployeeActionMenu: React.FC<EmployeeActionMenuProps> = ({ onEdit, onPayment, onDelete }) => {
	const { t } = useTranslation();
	const actions: ActionMenuRow[] = useMemo(
		() => [
			{
				key: "payment",
				label: t("common.payment"),
				icon: <PaymentIcon fontSize="small" color="primary" />,
				onClick: onPayment,
			},
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
		],
		[onDelete, onEdit, onPayment, t],
	);

	return <ActionMenu actions={actions} />;
};

export default EmployeeActionMenu;
