import React from "react";
import { Link } from "@mui/material";
import { translate } from "i18n/i18n";
import { PaymentAllocation } from "models/payment";

// TODO: Fix this to use proper options
const labelMap = {
	AdvancePayment: "",
	ChangeReturn: "",
	Sale: translate("paymentAllocationSale"),
	Supply: translate("paymentAllocationSupply"),
	SaleRefund: translate("paymentAllocationSaleRefund"),
	SupplyRefund: translate("paymentAllocationSupplyRefund"),
} as const;

const routeMap = {
	AdvancePayment: "",
	ChangeReturn: "",
	Sale: "/sales/",
	Supply: "/supplies/",
	SaleRefund: "/sale-refunds/",
	SupplyRefund: "/supply-refunds/",
} as const;

interface AllocationLinkProps {
	allocation: PaymentAllocation;
}

const AllocationLink: React.FC<AllocationLinkProps> = ({ allocation }) => {
	const { transactionId, type } = allocation;

	if (!transactionId) {
		return <>-</>;
	}

	if (allocation.type === "AdvancePayment") {
		return null;
	}

	if (allocation.type === "ChangeReturn") {
		return null;
	}

	return (
		<Link href={`${routeMap[type]}${transactionId}`} underline="hover" sx={{ color: "#1976d2" }}>
			{labelMap[type]} #{transactionId}
		</Link>
	);
};

export default AllocationLink;
