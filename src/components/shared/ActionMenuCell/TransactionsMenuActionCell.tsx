import React from "react";
import ArchiveIcon from "@mui/icons-material/Archive";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ActionMenuCell, { RowAction } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

interface Props {
	onEdit: () => void;
	onArchive: () => void;
	onDelete: () => void;
	onRefund: () => void;
}

const TransactionsActionsMenu: React.FC<Props> = ({ onEdit, onArchive, onDelete, onRefund }) => {
	const actions: RowAction[] = [
		{
			key: "edit",
			label: translate("actionEdit"),
			icon: <EditIcon fontSize="small" color="warning" />,
			onClick: onEdit,
		},
		{
			key: "refund",
			label: translate("actionRefund"),
			icon: <AssignmentReturnIcon fontSize="small" color="info" />,
			onClick: onRefund,
		},
		{
			key: "archive",
			label: translate("actionArchive"),
			icon: <ArchiveIcon fontSize="small" />,
			onClick: onArchive,
		},
		{
			key: "delete",
			label: translate("actionDelete"),
			icon: <DeleteIcon fontSize="small" color="error" />,
			onClick: onDelete,
		},
	];

	return <ActionMenuCell actions={actions} />;
};

export default TransactionsActionsMenu;
