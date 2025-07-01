import React from "react";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PaymentIcon from "@mui/icons-material/PaymentOutlined";
import ActionMenuCell, { RowAction } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

interface Props {
	fullyPaid: boolean;
	onPayment: () => void;
	onRefund: () => void;
}

const TransactionsActionsMenu: React.FC<Props> = ({ fullyPaid, onPayment, onRefund }) => {
	const actions: RowAction[] = [
		{
			key: "refund",
			label: translate("actionRefund"),
			icon: <AssignmentReturnIcon fontSize="small" color="info" />,
			onClick: onRefund,
		},
	];

	if (!fullyPaid) {
		actions.push({
			key: "payment",
			label: translate("transaction.addPayment"),
			icon: <PaymentIcon fontSize="small" color="success" />,
			onClick: onPayment,
		});
	}

	return <ActionMenuCell actions={actions} />;
};

export default TransactionsActionsMenu;
