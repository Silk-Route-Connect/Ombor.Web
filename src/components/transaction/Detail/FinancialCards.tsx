import React from "react";
import { useTranslation } from "react-i18next";
import PaymentStatusChip from "components/shared/Chip/PaymentStatusChip";
import DetailNote from "components/shared/Detail/DetailNote";
import { FactDivider, FactList, FactRow } from "components/shared/Detail/FactRow";
import HeroAmountCard from "components/shared/Detail/HeroAmountCard";
import DetailLink from "components/shared/Link/DetailLink";
import { TransactionStatus } from "models/transaction";
import { designTokens } from "theme";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { TransactionDirection } from "utils/transactionUtils";

/**
 * The sale / supply money hero: the served total with its payment status, then
 * what it is made of — subtotal and line discounts — and what was paid / is left.
 */
export const SaleFinancialCard: React.FC<{
	direction: TransactionDirection;
	total: number;
	subtotal: number;
	discount: number;
	paid: number;
	remaining: number;
	status: TransactionStatus;
}> = ({ direction, total, subtotal, discount, paid, remaining, status }) => {
	const { t } = useTranslation();
	return (
		<HeroAmountCard
			caption={t(`transaction.detail.fin.amount.${direction}`)}
			value={formatCurrency(total)}
			status={<PaymentStatusChip status={status} />}
		>
			<FactList divided={false} inset={false}>
				<FactRow label={t("transaction.detail.subtotal")} money={subtotal} />
				<FactRow
					label={t("transaction.detail.discountByLines")}
					money={discount}
					valueColor={designTokens.saffron700}
				/>
				<FactDivider />
				{/* Paid stays ink: in green a supply's outflow would read as income, in red
				    as a problem. The «Платежи» card below carries the money direction. */}
				<FactRow label={t("transaction.detail.fin.paid")} money={paid} />
				<FactRow
					label={t("transaction.detail.fin.remaining")}
					money={remaining}
					valueColor="error.main"
				/>
			</FactList>
		</HeroAmountCard>
	);
};

/** The refund money hero: the refunded amount, the original document, positions. */
export const RefundFinancialCard: React.FC<{
	direction: TransactionDirection;
	total: number;
	positions: number;
	originalNumber?: string;
	/** Detail route of the original document; empty while it is not loaded. */
	originalPath: string;
}> = ({ direction, total, positions, originalNumber, originalPath }) => {
	const { t } = useTranslation();
	return (
		<HeroAmountCard caption={t("transaction.detail.refundAmount")} value={formatCurrency(total)}>
			<FactList divided={false} inset={false}>
				<FactRow label={t(`transaction.detail.original.${direction}`)} figures="proportional">
					{originalNumber &&
						(originalPath ? (
							<DetailLink to={originalPath}>{formatEntityId(originalNumber)}</DetailLink>
						) : (
							formatEntityId(originalNumber)
						))}
				</FactRow>
				<FactRow label={t("transaction.detail.positionsReturned")} figures="tabular">
					{positions}
				</FactRow>
			</FactList>
			<DetailNote>{t("transaction.detail.refundImmutable")}</DetailNote>
		</HeroAmountCard>
	);
};
