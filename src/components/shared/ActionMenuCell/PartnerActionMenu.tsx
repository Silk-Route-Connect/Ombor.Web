import React from "react";
import { translate } from "i18n/i18n";

import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/PaymentOutlined";

import ActionMenu, { ActionMenuRow } from "./MenuActionCell";

interface PartnerActionMenuProps {
	onPayment(): void;
	onEdit(): void;
	onArchive(): void;
	onDelete(): void;
}

export const PartnerActionMenu: React.FC<PartnerActionMenuProps> = ({
	onPayment,
	onEdit,
	onArchive,
	onDelete,
}) => {
	const actions: ActionMenuRow[] = [
		{
			key: "payment",
			label: translate("common.payment"),
			icon: <PaymentIcon fontSize="small" color="info" />,
			onClick: onPayment,
		},
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
	];

	return <ActionMenu actions={actions} />;
};

export default PartnerActionMenu;
