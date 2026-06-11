import i18next from "i18n/config";
import { TransactionType } from "models/transaction";

export function getPratnerTranslationKey(type: TransactionType): string {
	if (type === "Sale" || type === "SaleRefund") {
		return "transaction.partner.customer";
	}

	return "transaction.partner.supplier";
}

export function dialogTranslation(key: "title" | "body" | "confirm" | "cancel"): string {
	return i18next.t(`common.dialog.discardChanges.${key}`);
}
