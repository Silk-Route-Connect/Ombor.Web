import { Measurement } from "./product";

/**
 * Transfer — an atomic, immutable, audited inter-warehouse stock movement
 * (business-rules §D, rule 16/116): both warehouses update at once, no status
 * workflow, no partner, no money. The backend's `/api/transfers` DTO is missing
 * the author and per-line unit the redesign shows and carries a `status` the
 * redesign drops, so the resource is mocked at this target v1 contract
 * (docs/mocking.md), deriving names/units from the Products + Warehouses mocks.
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

/** Σ of line quantities — the «Единиц» figure (display arithmetic over served lines). */
export function transferUnits(transfer: Transfer): number {
	return transfer.lines.reduce((sum, line) => sum + line.quantity, 0);
}
