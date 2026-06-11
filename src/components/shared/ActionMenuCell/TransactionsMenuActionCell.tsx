import React from "react";
import { useTranslation } from "react-i18next";
import ActionMenu, { ActionMenuRow } from "components/shared/ActionMenuCell/MenuActionCell";

import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PaymentIcon from "@mui/icons-material/PaymentOutlined";

interface Props {
	fullyPaid: boolean;
	onPayment: () => void;
	onRefund: () => void;
}

const TransactionsActionsMenu: React.FC<Props> = ({ fullyPaid, onPayment, onRefund }) => {
	const { t } = useTranslation();
	const actions: ActionMenuRow[] = [
		{
			key: "refund",
			label: t("actionRefund"),
			icon: <AssignmentReturnIcon fontSize="small" color="info" />,
			onClick: onRefund,
		},
	];

	if (!fullyPaid) {
		actions.push({
			key: "payment",
			label: t("transaction.addPayment"),
			icon: <PaymentIcon fontSize="small" color="success" />,
			onClick: onPayment,
		});
	}

	return <ActionMenu actions={actions} />;
};

export default TransactionsActionsMenu;
