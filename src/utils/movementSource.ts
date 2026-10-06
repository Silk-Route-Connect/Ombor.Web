import { TFunction } from "i18next";
import { MovementSourceRef } from "models/product";
import { TransactionType } from "models/transaction";
import {
	stockAdjustmentDetailPath,
	transactionDetailPath,
	transferDetailPath,
} from "routing/paths";

import { formatEntityId, formatOptionalNumber } from "./formatEntityId";

const TRANSACTION_KINDS: ReadonlySet<string> = new Set<TransactionType>([
	"Sale",
	"Supply",
	"SaleRefund",
	"SupplyRefund",
]);

/** Opening stock has no document to open; every other movement opens its source. */
export const isMovementSourceOpenable = (m: MovementSourceRef): boolean =>
	m.sourceType !== "OpeningStock";

/**
 * The № a movement row shows: the transaction's served number; a transfer or an
 * adjustment by its id, as their own lists label them; null for opening stock.
 */
export const movementSourceNumber = (m: MovementSourceRef): string | number | null => {
	if (m.sourceType === "Transaction") {
		return m.sourceNumber;
	}
	return isMovementSourceOpenable(m) ? m.sourceId : null;
};

/** The URL of a row's source document; null for opening stock (no document). */
export const movementSourcePath = (m: MovementSourceRef): string | null => {
	switch (m.sourceType) {
		case "Transaction":
			return TRANSACTION_KINDS.has(m.kind)
				? transactionDetailPath(m.kind as TransactionType, m.sourceId)
				: null;
		case "Transfer":
			return transferDetailPath(m.sourceId);
		case "StockAdjustment":
			return stockAdjustmentDetailPath(m.sourceId);
		default:
			return null;
	}
};

/**
 * A transfer or adjustment opens its modal detail over the movements tab (the
 * user keeps the tab); its URL still opens in a new tab. A sale / supply / refund
 * navigates to its page.
 */
export const movementSourceOpensInPlace = (m: MovementSourceRef): boolean =>
	m.sourceType === "Transfer" || m.sourceType === "StockAdjustment";

/** The CSV text of the № column — the same «№N» / «Без номера» / empty the cell shows. */
export const movementSourceCsv = (m: MovementSourceRef, t: TFunction): string => {
	if (!isMovementSourceOpenable(m)) {
		return "";
	}
	return m.sourceType === "Transaction"
		? formatOptionalNumber(m.sourceNumber, t("common.noNumber"))
		: formatEntityId(m.sourceId);
};
