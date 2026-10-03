import React from "react";
import { useTranslation } from "react-i18next";
import { kindPresentation } from "components/shared/Chip/movementKind";
import StatusPill from "components/shared/Chip/StatusPill";
import { TransactionType } from "models/transaction";
import { directionOf, isRefundType } from "utils/transactionUtils";

/**
 * Transaction type pill — the shared kind presentation (teal Sale, saffron
 * Supply, outlined refunds, with icons) under the transaction's own short labels.
 */
export const TransactionTypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
	const { t } = useTranslation();
	const direction = directionOf(type);
	const { token, icon } = kindPresentation(type);
	const label = isRefundType(type)
		? t(`transaction.badge.refund.${direction}`)
		: t(`transaction.badge.base.${direction}`);

	return <StatusPill token={token} icon={icon} label={label} />;
};
