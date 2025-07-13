import { GetInventoriesRequest, Inventory, InventoryItem } from "../../models/inventory";

/* ------------------------------------------------------------------ */
/* fake data                                                          */
/* ------------------------------------------------------------------ */
const FAKE_INVENTORIES: Inventory[] = [
	{ id: 1, name: "Central Warehouse", location: "Tashkent" },
	{ id: 2, name: "Samarkand Depot", location: "Samarkand" },
	{ id: 3, name: "Andijan Store", location: "Andijan" },
];

const FAKE_ITEMS: Record<number, InventoryItem[]> = {
	1: [
		{ id: 1, inventoryId: 1, productId: 1, quantityInStock: 320 },
		{ id: 2, inventoryId: 1, productId: 2, quantityInStock: 150 },
		{ id: 3, inventoryId: 1, productId: 3, quantityInStock: 900 },
	],
	2: [
		{ id: 4, inventoryId: 2, productId: 1, quantityInStock: 50 },
		{ id: 5, inventoryId: 2, productId: 3, quantityInStock: 40 },
	],
	3: [{ id: 6, inventoryId: 3, productId: 2, quantityInStock: 70 }],
};

const sleep = (ms = 150) => new Promise((r) => setTimeout(r, ms));

class InventoryApi {
	async getAll(req?: GetInventoriesRequest): Promise<Inventory[]> {
		await sleep();

		let data = FAKE_INVENTORIES;

		if (req?.search) {
			const q = req.search.toLowerCase();
			data = data.filter(
				(inv) => inv.name.toLowerCase().includes(q) || inv.location?.toLowerCase().includes(q),
			);
		}

		return data;
	}

	async getById(id: number): Promise<Inventory | undefined> {
		await sleep();
		return FAKE_INVENTORIES.find((i) => i.id === id);
	}

	async getItems(inventoryId: number): Promise<InventoryItem[]> {
		await sleep();
		return FAKE_ITEMS[inventoryId] ?? [];
	}

	async create(request: Omit<Inventory, "id">): Promise<Inventory> {
		console.log("create inventory request:", request);
		throw new Error("Mock createInventory not implemented");
	}

	async update(request: Inventory): Promise<Inventory> {
		console.log("update inventory request:", request);
		throw new Error("Mock updateInventory not implemented");
	}

	async delete(inventoryId: number): Promise<void> {
		console.log("delete inventory request:", inventoryId);
		throw new Error("Mock deleteInventory not implemented");
	}
}

const inventoryApi = new InventoryApi();
export default inventoryApi;
