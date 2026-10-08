import { PartnerLedgerEntry } from "models/partner";
import { paymentDetailPath, saleDetailPath, supplyDetailPath } from "routing/paths";

export const TRANSACTION_TYPES = new Set(["sale", "supply", "refund-sale", "refund-supply"]);
export const PAYMENT_TYPES = new Set(["payment", "deposit", "withdraw"]);

export const deriveTransactions = (ledger: PartnerLedgerEntry[]): PartnerLedgerEntry[] =>
	ledger.filter((e) => TRANSACTION_TYPES.has(e.type));

export const derivePayments = (ledger: PartnerLedgerEntry[]): PartnerLedgerEntry[] =>
	ledger.filter((e) => PAYMENT_TYPES.has(e.type));

/** Detail route of the document behind a ledger row; null for the opening balance. */
export function ledgerSourcePath(entry: PartnerLedgerEntry): string | null {
	if (!entry.sourceId) {
		return null;
	}
	switch (entry.type) {
		case "sale":
		case "refund-sale":
			return saleDetailPath(entry.sourceId);
		case "supply":
		case "refund-supply":
			return supplyDetailPath(entry.sourceId);
		case "payment":
		case "deposit":
		case "withdraw":
			return paymentDetailPath(entry.sourceId);
		default:
			return null;
	}
}
