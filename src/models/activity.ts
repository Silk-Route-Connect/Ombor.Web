/**
 * Activity Log — the audit trail read back as operations (`GET /api/activity`,
 * backend-contracts/activity.md): who changed what and when, with before/after
 * values. Read-only; the server writes it on every save.
 */

/** What happened to one record in an operation. */
export type ActivityAction = "Created" | "Updated" | "Deleted" | "Archived" | "Restored";

export const ACTIVITY_ACTIONS: ActivityAction[] = [
	"Created",
	"Updated",
	"Archived",
	"Restored",
	"Deleted",
];

/** Records an operation can be about — the «Что» filter, in menu order. */
export const ACTIVITY_RECORD_KINDS = [
	"Sale",
	"Supply",
	"SaleRefund",
	"SupplyRefund",
	"Payment",
	"Payroll",
	"Order",
	"Adjustment",
	"Transfer",
	"OpeningStock",
	"WalletTransfer",
	"Product",
	"Category",
	"Partner",
	"Wallet",
	"Warehouse",
	"Employee",
	"Template",
	"Organization",
	"User",
] as const;

export type ActivityRecordKind = (typeof ACTIVITY_RECORD_KINDS)[number];

/** Parts of a record — they appear inside an operation's changes only. */
export type ActivityPartKind =
	| "TransactionLine"
	| "OrderLine"
	| "OrderStatusEvent"
	| "TemplateItem"
	| "TransferLine"
	| "PaymentComponent"
	| "PaymentAllocation"
	| "Stock";

export type ActivityEntityKind = ActivityRecordKind | ActivityPartKind;

/**
 * What an operation did, as one value (record kind × action). `Other` is the
 * server's fallback for a combination no write path produces.
 */
export type ActivityKind =
	| "SaleCreated"
	| "SaleUpdated"
	| "SupplyCreated"
	| "SupplyUpdated"
	| "SaleRefundCreated"
	| "SaleRefundUpdated"
	| "SupplyRefundCreated"
	| "SupplyRefundUpdated"
	| "PaymentCreated"
	| "PayrollPaid"
	| "AdjustmentCreated"
	| "TransferCreated"
	| "OpeningStockCreated"
	| "WalletTransferCreated"
	| "StockChanged"
	| "OrderCreated"
	| "OrderUpdated"
	| "OrderStatusChanged"
	| "ProductCreated"
	| "ProductUpdated"
	| "ProductArchived"
	| "ProductRestored"
	| "ProductDeleted"
	| "PartnerCreated"
	| "PartnerUpdated"
	| "PartnerArchived"
	| "PartnerRestored"
	| "PartnerDeleted"
	| "WalletCreated"
	| "WalletUpdated"
	| "WalletArchived"
	| "WalletRestored"
	| "WalletDeleted"
	| "WarehouseCreated"
	| "WarehouseUpdated"
	| "WarehouseArchived"
	| "WarehouseRestored"
	| "WarehouseDeleted"
	| "CategoryCreated"
	| "CategoryUpdated"
	| "CategoryDeleted"
	| "EmployeeCreated"
	| "EmployeeUpdated"
	| "EmployeeDeleted"
	| "TemplateCreated"
	| "TemplateUpdated"
	| "TemplateDeleted"
	| "OrganizationCreated"
	| "OrganizationUpdated"
	| "UserCreated"
	| "UserUpdated"
	| "Other";

/** A field value as stored: numbers, strings, booleans, arrays (phones); enums by name, dates as ISO strings. */
export type ActivityValue =
	| string
	| number
	| boolean
	| null
	| ActivityValue[]
	| { [key: string]: ActivityValue };

export type ActivityFieldChange = {
	/** camelCase property; a part of a record is dotted (`packaging.size`, `contactInfo.email`). */
	field: string;
	/** Before; absent on a created record or when the value was empty. */
	old?: ActivityValue;
	/** After; absent on a deleted record or when the value became empty. */
	new?: ActivityValue;
};

export type ActivityRecord = {
	entityKind: ActivityEntityKind;
	entityId: number;
	/**
	 * Bare document number (documents, orders), the id (adjustment, transfer,
	 * wallet transfer), or the name (master data, lines, stock rows).
	 */
	label?: string | null;
};

export type ActivityChange = ActivityRecord & {
	action: ActivityAction;
	/** Every recorded field of a created / deleted record; only the changed ones of an update. */
	fields: ActivityFieldChange[];
};

export type ActivityActor = { id: number; name: string };

export type ActivityItem = {
	operationId: string;
	/** UTC timestamp of the operation. */
	at: string;
	/** Absent for system work (seeding, registration) — shown as «Система». */
	actor?: ActivityActor | null;
	kind: ActivityKind;
	primary: ActivityRecord;
	/** The money figure of a money operation (see the contract's «Amount» table). */
	amount?: number | null;
	/** The primary record first; the list caps it at 50 — see `changeCount`. */
	changes: ActivityChange[];
	changeCount: number;
};

export type ActivityPage = {
	items: ActivityItem[];
	/** Matching operations across all pages. */
	total: number;
};

/** `GET /api/activity` query — every filter optional, combined with AND. */
export type GetActivityRequest = {
	entityKind?: ActivityRecordKind;
	/** Requires `entityKind`: the record or one of its lines (a detail page's «История»). */
	entityId?: number;
	userId?: number;
	action?: ActivityAction;
	/** Local calendar days «yyyy-MM-dd», inclusive. */
	from?: string;
	to?: string;
	page?: number;
	pageSize?: number;
};
