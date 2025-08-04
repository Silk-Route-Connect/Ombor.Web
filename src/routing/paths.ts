import { TransactionType } from "models/transaction";

export const TRANSACTION_ROUTES: Record<TransactionType, string> = {
	Sale: "/sales",
	Supply: "/supplies",
	SaleRefund: "/refunds/sales",
	SupplyRefund: "/refunds/supplies",
};
