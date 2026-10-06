import { ActivityRecord } from "models/activity";
import {
	employeeDetailPath,
	orderDetailPath,
	partnerDetailPath,
	PATHS,
	paymentDetailPath,
	productDetailPath,
	stockAdjustmentDetailPath,
	transactionDetailPath,
	transferDetailPath,
	walletDetailPath,
	warehouseDetailPath,
} from "routing/paths";

/**
 * Where a recorded record opens (the contract's «Deep links»), or `undefined`
 * when it has no page of its own — a category or template (plain text, as in
 * tables), opening stock and wallet transfers (open the warehouse / wallet),
 * record parts and stock rows.
 */
export function activityRecordPath(record: ActivityRecord): string | undefined {
	const id = record.entityId;
	switch (record.entityKind) {
		case "Sale":
		case "Supply":
		case "SaleRefund":
		case "SupplyRefund":
			return transactionDetailPath(record.entityKind, id);
		case "Payment":
		case "Payroll":
			return paymentDetailPath(id);
		case "Order":
			return orderDetailPath(id);
		case "Adjustment":
			return stockAdjustmentDetailPath(id);
		case "Transfer":
			return transferDetailPath(id);
		case "Product":
			return productDetailPath(id);
		case "Partner":
			return partnerDetailPath(id);
		case "Wallet":
			return walletDetailPath(id);
		case "Warehouse":
			return warehouseDetailPath(id);
		case "Employee":
			return employeeDetailPath(id);
		case "Organization":
		case "User":
			return PATHS.settings;
		default:
			return undefined;
	}
}
