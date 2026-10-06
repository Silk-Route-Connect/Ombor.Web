import { ActivityItem } from "models/activity";
import { formatCurrency } from "utils/formatCurrency";
import { formatPartnerBalance, partnerBalanceColor } from "utils/partnerUtils";
import { paymentDirectionColor } from "utils/paymentUtils";

import { currentValue, findField, findPrimaryChange } from "./activitySentence";

/** The money figure of an operation as shown beside its sentence. */
export interface ActivityAmount {
	text: string;
	/** Palette colour: ink, or green / red where the figure is a direction (payments, a partner's balance). */
	color: string;
}

/**
 * Ink for documents, stock values and transfers; a payment green or red by its
 * direction (payroll always out); a partner's opening balance signed from the
 * partner's side like every partner balance (DR-27).
 */
export function activityAmount(item: ActivityItem): ActivityAmount | null {
	const amount = item.amount;
	if (amount === undefined || amount === null) {
		return null;
	}
	if (item.primary.entityKind === "Partner") {
		return { text: formatPartnerBalance(amount), color: partnerBalanceColor(amount) };
	}
	if (item.kind === "PayrollPaid") {
		return { text: formatCurrency(amount), color: paymentDirectionColor("Expense") };
	}
	if (item.kind === "PaymentCreated") {
		const direction = currentValue(findField(findPrimaryChange(item), "direction"));
		if (direction === "Income" || direction === "Expense") {
			return { text: formatCurrency(amount), color: paymentDirectionColor(direction) };
		}
	}
	return { text: formatCurrency(amount), color: "text.primary" };
}
