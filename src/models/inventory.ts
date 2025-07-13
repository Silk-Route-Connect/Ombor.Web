export type Inventory = {
	id: number;
	name: string;
	description?: string;
	location?: string;
};

export type InventoryItem = {
	id: number;
	inventoryId: number;
	productId: number;
	quantityInStock: number;
};

export type GetInventoriesRequest = { search?: string };

export type CreateInventoryRequest = Omit<Inventory, "id">;

export type UpdateInventoryRequest = {
	id: number;
	name: string;
	description?: string;
	location?: string;
};
