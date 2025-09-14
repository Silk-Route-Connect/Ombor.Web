import React from "react";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";
import { translate } from "i18n/i18n";

import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PaymentIcon from "@mui/icons-material/PaymentOutlined";

interface Props {
	fullyPaid: boolean;
	onPayment: () => void;
	onRefund: () => void;
}

const TransactionMenuCell: React.FC<Props> = ({ fullyPaid, onPayment, onRefund }) => {
	const actions: ActionMenuRow[] = [
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

	return <ActionMenu actions={actions} />;
};

export default TransactionMenuCell;
