import React from "react";
import { useTranslation } from "react-i18next";
import DetailLink from "components/shared/Link/DetailLink";
import { PaymentAllocation } from "models/payment";
import { saleDetailPath, supplyDetailPath } from "routing/paths";

/** i18n label key per linkable allocation type (resolved at render, not import). */
const LABEL_KEY: Record<"Sale" | "Supply" | "SaleRefund" | "SupplyRefund", string> = {
	Sale: "paymentAllocationSale",
	Supply: "paymentAllocationSupply",
	SaleRefund: "paymentAllocationSaleRefund",
	SupplyRefund: "paymentAllocationSupplyRefund",
};

interface AllocationLinkProps {
	allocation: PaymentAllocation;
}

/**
 * Links a payment allocation to its settled transaction's detail page. Supplies
 * (and supply refunds) route to `/supplies/:id`, sales to `/sales/:id`; advance /
 * change allocations have no transaction to open.
 */
const AllocationLink: React.FC<AllocationLinkProps> = ({ allocation }) => {
	const { t } = useTranslation();
	const { transactionId, type } = allocation;

	if (!transactionId) {
		return <>-</>;
	}
	if (type === "AdvancePayment" || type === "ChangeReturn") {
		return null;
	}

	const to =
		type === "Supply" || type === "SupplyRefund"
			? supplyDetailPath(transactionId)
			: saleDetailPath(transactionId);

	return <DetailLink to={to}>{`${t(LABEL_KEY[type])} #${transactionId}`}</DetailLink>;
};

export default AllocationLink;
