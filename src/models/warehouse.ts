export type Warehouse = {
	id: number;
	name: string;
	location: string | null;
	isActive: boolean;
	notes?: string | null;
	items: WarehouseItem[];
};

export type WarehouseItem = {
	id: number;
	warehouseId: number;
	productId: number;
	quantity: number;
	lowStockThreshold: number;
};

export type GetWarehousesRequest = {
	searchTerm?: string;
};

export type GetWarehouseByIdRequest = {
	id: number;
};

export type CreateWarehouseRequest = {
	name: string;
	location?: string | null;
	isActive: boolean;
	notes?: string | null;
};

export type UpdateWarehouseRequest = {
	id: number;
	name: string;
	location?: string | null;
	isActive: boolean;
	notes?: string | null;
};

export type DeleteWarehouseRequest = {
	id: number;
};

// Warehouse Movements (Stock History)
export const MOVEMENT_TYPES = [
	"Sale",
	"Supply",
	"TransferIn",
	"TransferOut",
	"Adjustment",
	"SaleRefund",
	"SupplyRefund",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export type WarehouseMovementReference = "Transaction" | "Transfer" | "Adjustment";

export type WarehouseMovement = {
	id: number;
	createdAt: string | Date;
	productId: number;
	productName: string;
	productSku: string;
	type: MovementType;
	quantityChange: number;
	balanceAfter: number;
	referenceType: WarehouseMovementReference | null; // "Transaction", "Transfer", "Adjustment"
	referenceId: number | null;
	userId: number;
	userName: string;
	notes: string | null;
};

export type GetWarehouseMovementsRequest = {
	warehouseId: number;
	from?: string; // ISO date
	to?: string; // ISO date
	productId?: number;
};

export type AdjustStockItemRequest = {
	productId: number;
	newQuantity: number;
	lowStockThreshold?: number;
};

export type AdjustStockRequest = {
	warehouseId: number;
	items: AdjustStockItemRequest[];
	notes: string;
};

export type AdjustStockResponse = {
	warehouseId: number;
	updatedItems: WarehouseItem[];
};
