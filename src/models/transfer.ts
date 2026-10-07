import { Measurement } from "./product";

/**
 * Transfer — an atomic, immutable, audited inter-warehouse stock movement
 * (business-rules §D, rule 16/116): both warehouses update at once, no status
 * workflow, no partner, no money. Served by `/api/transfers`
 * (backend-contracts/inventory.md).
 */
export type TransferLine = {
	productId: number;
	productName: string;
	sku: string;
	measurement: Measurement;
	quantity: number;
};

export type Transfer = {
	id: number;
	/** ISO date-time string. */
	date: string;
	fromWarehouseId: number;
	fromWarehouseName: string;
	toWarehouseId: number;
	toWarehouseName: string;
	note: string | null;
	/** Audit: who recorded the transfer. */
	createdBy: string;
	lines: TransferLine[];
};

export type CreateTransferLine = {
	productId: number;
	quantity: number;
};

export type CreateTransferRequest = {
	fromWarehouseId: number;
	toWarehouseId: number;
	note: string | null;
	lines: CreateTransferLine[];
};
