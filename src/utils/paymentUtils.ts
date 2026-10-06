import type { MoneyTone } from "components/shared/Table/cells/MoneyCell";
import { PaymentDirection } from "models/payment";

/** Tone of a payment amount: money in green, money out red — on every surface. */
export const paymentMoneyTone = (direction: PaymentDirection): MoneyTone =>
	direction === "Income" ? "income" : "expense";

/** Palette colour of a payment amount outside a table cell (hero figures, cards). */
export const paymentDirectionColor = (direction: PaymentDirection): string =>
	direction === "Income" ? "success.main" : "error.main";
