import React from "react";
import { Link } from "@mui/material";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";

const labelMap = {
	Sale: translate("paymentAllocationSale"),
	Supply: translate("paymentAllocationSupply"),
	SaleRefund: translate("paymentAllocationSaleRefund"),
	SupplyRefund: translate("paymentAllocationSupplyRefund"),
} as const;

const routeMap = {
	Sale: "/sales/",
	Supply: "/supplies/",
	SaleRefund: "/sale-refunds/",
	SupplyRefund: "/supply-refunds/",
} as const;

interface Props {
	allocation: PaymentAllocation;
}

/** Renders a link like “Продажа #123” or plain “-” if transactionId missing */
const AllocationLink: React.FC<Props> = ({ allocation }) => {
	const { transactionId, type } = allocation;

	if (!transactionId) {
		return <>-</>;
	}

	return (
		<Link href={`${routeMap[type]}${transactionId}`} underline="hover" sx={{ color: "#1976d2" }}>
			{labelMap[type]} #{transactionId}
		</Link>
	);
};

export default AllocationLink;
