import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PaymentIcon from "@mui/icons-material/Payment";

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
	const { t } = useTranslation();
	const actions: ActionMenuRow[] = useMemo(
		() => [
			{
				key: "payment",
				label: t("partner.payment"),
				icon: <PaymentIcon />,
				onClick: onPayment,
			},
			{
				key: "edit",
				label: t("common.edit"),
				icon: <EditIcon />,
				onClick: onEdit,
			},
			{
				key: "archive",
				label: t("common.archive"),
				icon: <ArchiveIcon />,
				onClick: onArchive,
			},
			{
				key: "delete",
				label: t("common.delete"),
				icon: <DeleteIcon />,
				onClick: onDelete,
			},
		],
		[onPayment, onEdit, onArchive, onDelete, t],
	);

	return <ActionMenu actions={actions} />;
};

export default PartnerActionMenu;
