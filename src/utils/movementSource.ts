import { TFunction } from "i18next";
import { MovementSourceRef } from "models/product";
import { TransactionType } from "models/transaction";
import { transactionDetailPath } from "routing/paths";

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

/** The routed detail of a sale / supply / refund row; null for modal-only sources. */
export const movementSourcePath = (m: MovementSourceRef): string | null =>
	m.sourceType === "Transaction" && TRANSACTION_KINDS.has(m.kind)
		? transactionDetailPath(m.kind as TransactionType, m.sourceId)
		: null;

/** The CSV text of the № column — the same «№N» / «Без номера» / empty the cell shows. */
export const movementSourceCsv = (m: MovementSourceRef, t: TFunction): string => {
	if (!isMovementSourceOpenable(m)) {
		return "";
	}
	return m.sourceType === "Transaction"
		? formatOptionalNumber(m.sourceNumber, t("common.noNumber"))
		: formatEntityId(m.sourceId);
};
