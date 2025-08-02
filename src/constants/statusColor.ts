import { TransactionStatus } from "models/transaction";

export const TRANSACTION_STATUS_COLORS: Record<
	TransactionStatus,
	"default" | "success" | "info" | "warning" | "error"
> = {
	Open: "warning",
	Closed: "success",
	PartiallyPaid: "info",
	Overdue: "error",
};
