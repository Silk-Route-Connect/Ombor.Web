import { translate } from "i18n/i18n";
import { TransactionType } from "models/transaction";

export function getPratnerTranslationKey(type: TransactionType): string {
	if (type === "Sale" || type === "SaleRefund") {
		return "transaction.partner.customer";
	}

	return "transaction.partner.supplier";
}

export function dialogTranslation(key: "title" | "body" | "confirm" | "cancel"): string {
	return translate(`common.dialog.discardChanges.${key}`);
}
