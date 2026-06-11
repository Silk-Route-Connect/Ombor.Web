import React from "react";
import i18next from "i18n/config";
import { PaymentAllocation } from "models/payment";

import { Link } from "@mui/material";

// TODO: Fix this to use proper options
const labelMap = {
	AdvancePayment: "",
	ChangeReturn: "",
	Sale: i18next.t("paymentAllocationSale"),
	Supply: i18next.t("paymentAllocationSupply"),
	SaleRefund: i18next.t("paymentAllocationSaleRefund"),
	SupplyRefund: i18next.t("paymentAllocationSupplyRefund"),
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
