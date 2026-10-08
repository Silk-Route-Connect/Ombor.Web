import { TransactionType } from "models/transaction";

export function getPratnerTranslationKey(type: TransactionType): string {
	if (type === "Sale" || type === "SaleRefund") {
		return "transaction.partner.customer";
	}

	return "transaction.partner.supplier";
}
