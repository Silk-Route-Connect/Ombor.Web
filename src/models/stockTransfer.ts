export type StockTransferItem = {
	productId: number;
	quantity: number;
};

export type StockTransferItemDetails = {
	productId: number;
	productName: string;
	productSku: string;
	quantity: number;
};

export type CreateStockTransferRequest = {
	fromWarehouseId: number;
	toWarehouseId: number;
	items: StockTransferItem[];
	notes?: string | null;
};

export type StockTransfer = {
	id: number;
	createdAt: string | Date;
	fromWarehouseId: number;
	fromWarehouseName: string;
	toWarehouseId: number;
	toWarehouseName: string;
	productsCount: number;
	totalQuantity: number;
	userId: number;
	userName: string;
	notes: string | null;
	items: StockTransferItemDetails[]; // ← Added
};

export type GetStockTransfersRequest = {
	from?: string;
	to?: string;
	fromWarehouseId?: number;
	toWarehouseId?: number;
};
