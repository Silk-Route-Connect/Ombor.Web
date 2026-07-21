import React from "react";
import { useTranslation } from "react-i18next";
import DetailLink from "components/shared/Link/DetailLink";
import { TransactionType } from "models/transaction";
import { saleDetailPath, supplyDetailPath } from "routing/paths";
import { directionOf } from "utils/transactionUtils";

interface TransactionLinkProps {
	id: number;
	type: TransactionType;
}

/**
 * Navigates to a transaction's routed detail page. Sales and supplies (and their
 * refunds) render on the direction's detail route — `/sales/:id` / `/supplies/:id`
 * — resolved by `directionOf`; there is no separate refund route.
 */
const TransactionLink: React.FC<TransactionLinkProps> = ({ id, type }) => {
	const { t } = useTranslation();
	const to = directionOf(type) === "Supply" ? supplyDetailPath(id) : saleDetailPath(id);

	return <DetailLink to={to}>{`${t(`transaction.type.${type}`)} #${id}`}</DetailLink>;
};

export default TransactionLink;
