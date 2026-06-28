import React from "react";
import DetailLink from "components/shared/Link/DetailLink";
import { paymentDetailPath } from "routing/paths";

interface PaymentLinkProps {
	id: number;
}

/** Navigates to the payment's routed detail page. */
const PaymentLink: React.FC<PaymentLinkProps> = ({ id }) => (
	<DetailLink to={paymentDetailPath(id)}>№{id}</DetailLink>
);

export default PaymentLink;
