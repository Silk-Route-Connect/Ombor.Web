import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { Wallet } from "models/wallet";
import { formatCurrency } from "utils/formatCurrency";

import { Box } from "@mui/material";

import { POS_CARD_PADDING, posSummaryCardSx } from "./posStyles";
import OverpaymentBreakdown from "./Summary/OverpaymentBreakdown";
import PartnerBalanceBlock from "./Summary/PartnerBalanceBlock";
import PaymentTender from "./Summary/PaymentTender";
import SummaryRow from "./Summary/SummaryRow";
import SummarySubmit from "./Summary/SummarySubmit";
import SummaryTotal from "./Summary/SummaryTotal";

interface TransactionSummaryCardProps {
	entry: UseTransactionEntry;
	wallets: Wallet[];
	/** True when a Supply tender exceeds the paying wallet's balance (hard-block). */
	overWallet: boolean;
	onOpenSettle: () => void;
	onSubmit: () => void;
}

/**
 * Right-column summary shared by New Sale + New Supply: the partner balance card,
 * the Подытог → Скидка → Итого flow, the payment breakdown (what is left to pay,
 * or where an overpayment goes — rule 40), the wallet + amount tender, and the
 * submit with its immutability note. Labels follow the entry's `direction`.
 */
export const TransactionSummaryCard: React.FC<TransactionSummaryCardProps> = ({
	entry,
	wallets,
	overWallet,
	onOpenSettle,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const { direction, partner, items, subtotal, discTotal, total, paid, remaining, payState } =
		entry;
	const hasItems = items.length > 0;
	const remainingColor = direction === "Sale" ? "warning.dark" : "error.main";

	return (
		<Box sx={posSummaryCardSx}>
			<PartnerBalanceBlock
				direction={direction}
				partner={partner}
				balanceAfter={entry.balanceAfter}
				showAfter={hasItems}
			/>

			<Box sx={{ p: POS_CARD_PADDING, display: "flex", flexDirection: "column", gap: "12px" }}>
				<SummaryRow label={t("transaction.new.totals.subtotal")} value={formatCurrency(subtotal)} />
				<SummaryRow
					label={t("transaction.new.totals.discount")}
					value={discTotal > 0 ? `−${formatCurrency(discTotal)}` : "—"}
					valueColor={discTotal > 0 ? "error.main" : "text.disabled"}
				/>
				<SummaryTotal label={t("transaction.new.totals.total")} total={total} />

				{hasItems && (
					<>
						<Box sx={{ borderTop: "1px solid", borderColor: "divider", my: "4px" }} />
						<SummaryRow
							label={t("transaction.new.totals.payment")}
							value={
								<>
									{formatCurrency(paid)}
									<UzsUnit />
								</>
							}
							bold
						/>
						{payState === "over" ? (
							<OverpaymentBreakdown entry={entry} onOpenSettle={onOpenSettle} />
						) : (
							<SummaryRow
								label={t(`transaction.new.totals.remaining.${direction}`)}
								value={formatCurrency(remaining)}
								valueColor={remaining > 0 ? remainingColor : "text.disabled"}
							/>
						)}
					</>
				)}
			</Box>

			<PaymentTender
				direction={direction}
				wallets={wallets}
				pay={entry.pay}
				total={total}
				setPay={entry.setPay}
			/>

			<SummarySubmit
				direction={direction}
				stockError={entry.tried && entry.hasStockError && hasItems}
				walletShortOf={
					entry.tried && overWallet
						? (wallets.find((w) => w.id === entry.pay.walletId)?.balance ?? 0)
						: null
				}
				onSubmit={onSubmit}
			/>
		</Box>
	);
};

export default TransactionSummaryCard;
