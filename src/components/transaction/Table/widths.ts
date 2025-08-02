import { TransactionColumn } from "./columns";

export type TableMode = "full" | "compact";

const CURRENCY_COLUMN_WIDTH = "clamp(150px, 20%, 170px)";

export const WIDTHS: Record<TableMode, Partial<Record<TransactionColumn, string>>> = {
	full: {
		id: "clamp(60px, 10%, 120px)",
		date: "clamp(80px, 10%, 100px)",
		partnerName: "clamp(80px, 10%, 100px)",
		totalDue: CURRENCY_COLUMN_WIDTH,
		totalPaid: CURRENCY_COLUMN_WIDTH,
		unpaidAmount: CURRENCY_COLUMN_WIDTH,
		status: "clamp(90px, 10%, 120px)",
		notes: "auto",
		menu: "70px",
	},

	compact: {
		id: "clamp(80px, 25%,  100px)",
		date: "clamp(80px, 25%, 100px)",
		totalDue: CURRENCY_COLUMN_WIDTH,
		totalPaid: CURRENCY_COLUMN_WIDTH,
		status: "clamp(100px, 15%, 130px)",
		menu: "70px",
	},
};
