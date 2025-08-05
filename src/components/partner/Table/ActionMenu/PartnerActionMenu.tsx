import React, { useMemo } from "react";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

export interface PartnerActionMenuProps {
	onPayment: () => void;
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
}

const PartnerActionMenu: React.FC<PartnerActionMenuProps> = ({
	onPayment,
	onEdit,
	onArchive,
	onDelete,
}) => {
	const actions: ActionMenuRow[] = useMemo(() => {
		const actions: ActionMenuRow[] = [
			{
				key: "payment",
				label: translate("partner.payment"),
				icon: <PaymentIcon />,
				onClick: onPayment,
			},
			{
				key: "edit",
				label: translate("common.edit"),
				icon: <EditIcon />,
				onClick: onEdit,
			},
			{
				key: "archive",
				label: translate("common.archive"),
				icon: <ArchiveIcon />,
				onClick: onArchive,
			},
			{
				key: "delete",
				label: translate("common.delete"),
				icon: <DeleteIcon />,
				onClick: onDelete,
			},
		];

		return actions;
	}, [onPayment, onEdit, onArchive, onDelete]);

	return <ActionMenu actions={actions} />;
};

export default PartnerActionMenu;
