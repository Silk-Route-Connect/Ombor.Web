import { WarehouseItem } from "models/warehouse";

export type AdjustStockItemRequest = {
	productId: number;
	newQuantity: number;
	lowStockThreshold?: number;
};

export type AdjustStockRequest = {
	warehouseId: number;
	items: AdjustStockItemRequest[];
	notes: string; // Mandatory, min 10 chars
};

export type AdjustStockResponse = {
	warehouseId: number;
	updatedItems: WarehouseItem[];
};
