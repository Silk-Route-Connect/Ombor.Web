import React from "react";
import { useTranslation } from "react-i18next";
import UzsUnit from "components/shared/Money/UzsUnit";
import { UseTransactionEntry } from "hooks/transactions/useTransactionEntry";
import { Wallet } from "models/wallet";
import { numericSx } from "theme";
import { formatCurrency } from "utils/formatCurrency";

import { Box, Typography } from "@mui/material";

import OverpaymentBreakdown from "./Summary/OverpaymentBreakdown";
import PartnerBalanceBlock from "./Summary/PartnerBalanceBlock";
import PaymentTender from "./Summary/PaymentTender";
import SummaryRow from "./Summary/SummaryRow";
import SummarySubmit from "./Summary/SummarySubmit";

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
		<Box
			sx={{
				bgcolor: "background.paper",
				border: "1px solid",
				borderColor: "divider",
				borderRadius: "12px",
				boxShadow: 1,
				position: "sticky",
				top: 16,
			}}
		>
			<PartnerBalanceBlock
				direction={direction}
				partner={partner}
				balanceAfter={entry.balanceAfter}
				showAfter={hasItems}
			/>

			<Box sx={{ p: "16px 18px", display: "flex", flexDirection: "column", gap: "11px" }}>
				<SummaryRow label={t("transaction.new.totals.subtotal")} value={formatCurrency(subtotal)} />
				<SummaryRow
					label={t("transaction.new.totals.discount")}
					value={discTotal > 0 ? `−${formatCurrency(discTotal)}` : "—"}
					valueColor={discTotal > 0 ? "error.main" : "text.disabled"}
				/>
				<Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
					<Typography sx={{ fontSize: 15, fontWeight: 700 }}>
						{t("transaction.new.totals.total")}
					</Typography>
					<Typography
						sx={{
							...numericSx,
							fontSize: 20,
							fontWeight: 700,
							color: "primary.main",
							letterSpacing: "-0.02em",
						}}
					>
						{formatCurrency(total)}
						<UzsUnit />
					</Typography>
				</Box>

				{hasItems && (
					<>
						<Box sx={{ borderTop: "1px solid", borderColor: "divider", my: "3px" }} />
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
