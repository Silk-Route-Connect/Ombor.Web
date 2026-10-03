import React from "react";
import { useTranslation } from "react-i18next";
import { TransactionStatus } from "models/transaction";
import { ChipTokenKey } from "theme";

import StatusPill from "./StatusPill";

/**
 * Served payment-status vocabularies: the transaction enum, and the lowercase
 * settlement status of the partner ledger / dashboard read models.
 */
export type SettlementStatus = "paid" | "partial" | "unpaid";
export type PaymentStatusValue = TransactionStatus | SettlementStatus;

const CANONICAL: Record<PaymentStatusValue, TransactionStatus> = {
	Open: "Open",
	PartiallyPaid: "PartiallyPaid",
	Overdue: "Overdue",
	Closed: "Closed",
	unpaid: "Open",
	partial: "PartiallyPaid",
	paid: "Closed",
};

/** Owner decision 2026-10-03: the same colours on every surface (Overdue = red). */
const TOKEN: Record<TransactionStatus, ChipTokenKey> = {
	Open: "open",
	PartiallyPaid: "partiallyPaid",
	Overdue: "overdue",
	Closed: "closed",
};

/**
 * Payment-status chip for transactions — «Не оплачено» (blue) / «Частично»
 * (amber) / «Просрочено» (red) / «Оплачено» (green). Accepts either served
 * vocabulary; an unknown value renders as Open rather than crashing a row.
 */
export const PaymentStatusChip: React.FC<{ status: PaymentStatusValue }> = ({ status }) => {
	const { t } = useTranslation();
	const canonical = CANONICAL[status] ?? "Open";
	return <StatusPill token={TOKEN[canonical]} label={t(`transaction.statusShort.${canonical}`)} />;
};

export default PaymentStatusChip;
