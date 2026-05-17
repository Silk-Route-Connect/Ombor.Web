import {
	AdjustStockRequest,
	AdjustStockResponse,
	CreateWarehouseRequest,
	GetWarehouseByIdRequest,
	GetWarehouseMovementsRequest,
	GetWarehousesRequest,
	UpdateWarehouseRequest,
	Warehouse,
	WarehouseMovement,
} from "models/warehouse";

import BaseApi from "./BaseApi";

// Mock data
const mockWarehouses: Warehouse[] = [
	{
		id: 1,
		name: "Main Warehouse",
		location: "123 Main St, Tashkent",
		isActive: true,
		items: [
			{ id: 1, warehouseId: 1, productId: 308, quantity: 50, lowStockThreshold: 10 },
			{ id: 2, warehouseId: 1, productId: 68, quantity: 5, lowStockThreshold: 15 },
			{ id: 3, warehouseId: 1, productId: 69, quantity: 100, lowStockThreshold: 20 },
		],
	},
	{
		id: 2,
		name: "Retail Store",
		location: "456 Park Ave, Tashkent",
		isActive: true,
		items: [
			{ id: 4, warehouseId: 2, productId: 70, quantity: 25, lowStockThreshold: 5 },
			{ id: 5, warehouseId: 2, productId: 69, quantity: 8, lowStockThreshold: 10 },
		],
	},
	{
		id: 3,
		name: "Storage Room B",
		location: null,
		isActive: false,
		items: [],
	},
];

const mockMovements: WarehouseMovement[] = [
	{
		id: 1,
		createdAt: new Date("2025-01-15T10:30:00"),
		productId: 67,
		productName: "Product A",
		productSku: "SKU-001",
		type: "Supply",
		quantityChange: 50,
		balanceAfter: 50,
		referenceType: "Transaction",
		referenceId: 101,
		userId: 1,
		userName: "Admin User",
		notes: null,
	},
	{
		id: 2,
		createdAt: new Date("2025-01-16T14:20:00"),
		productId: 68,
		productName: "Product A",
		productSku: "SKU-001",
		type: "Sale",
		quantityChange: -10,
		balanceAfter: 40,
		referenceType: "Transaction",
		referenceId: 102,
		userId: 1,
		userName: "Admin User",
		notes: null,
	},
	{
		id: 3,
		createdAt: new Date("2025-01-17T09:15:00"),
		productId: 69,
		productName: "Product B",
		productSku: "SKU-002",
		type: "Adjustment",
		quantityChange: -5,
		balanceAfter: 5,
		referenceType: "Adjustment",
		referenceId: 1,
		userId: 1,
		userName: "Admin User",
		notes: "Damaged items removed",
	},
];

let nextWarehouseId = 4;
let nextItemId = 6;

class WarehouseApi extends BaseApi {
	constructor() {
		super("warehouses");
	}

	async getAll(request?: GetWarehousesRequest | null): Promise<Warehouse[]> {
		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 300));

		let warehouses = [...mockWarehouses];

		if (request?.searchTerm) {
			const term = request.searchTerm.toLowerCase();
			warehouses = warehouses.filter(
				(w) => w.name.toLowerCase().includes(term) || w.location?.toLowerCase().includes(term),
			);
		}

		return warehouses;
	}

	async getById(request: GetWarehouseByIdRequest): Promise<Warehouse> {
		await new Promise((resolve) => setTimeout(resolve, 200));

		const warehouse = mockWarehouses.find((w) => w.id === request.id);
		if (!warehouse) {
			throw new Error(`Warehouse with id ${request.id} not found`);
		}

		return warehouse;
	}

	async create(request: CreateWarehouseRequest): Promise<Warehouse> {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const newWarehouse: Warehouse = {
			id: nextWarehouseId++,
			name: request.name,
			location: request.location ?? null,
			isActive: request.isActive,
			items: [],
		};

		mockWarehouses.push(newWarehouse);
		return newWarehouse;
	}

	async update(request: UpdateWarehouseRequest): Promise<Warehouse> {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const index = mockWarehouses.findIndex((w) => w.id === request.id);
		if (index === -1) {
			throw new Error(`Warehouse with id ${request.id} not found`);
		}

		mockWarehouses[index] = {
			...mockWarehouses[index],
			name: request.name,
			location: request.location ?? null,
			isActive: request.isActive,
		};

		return mockWarehouses[index];
	}

	async delete(id: number): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 300));

		const index = mockWarehouses.findIndex((w) => w.id === id);
		if (index === -1) {
			throw new Error(`Warehouse with id ${id} not found`);
		}

		mockWarehouses.splice(index, 1);
	}

	async getMovements(request: GetWarehouseMovementsRequest): Promise<WarehouseMovement[]> {
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Filter movements by warehouseId (in real implementation, backend would do this)
		let movements = [...mockMovements];

		if (request.productId) {
			movements = movements.filter((m) => m.productId === request.productId);
		}

		// Sort by date descending (newest first)
		movements.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		return movements;
	}

	async adjustStock(request: AdjustStockRequest): Promise<AdjustStockResponse> {
		await new Promise((resolve) => setTimeout(resolve, 400));

		const warehouse = mockWarehouses.find((w) => w.id === request.warehouseId);
		if (!warehouse) {
			throw new Error(`Warehouse with id ${request.warehouseId} not found`);
		}

		// Update warehouse items
		request.items.forEach((item) => {
			const existingIndex = warehouse.items.findIndex((i) => i.productId === item.productId);

			if (existingIndex >= 0) {
				// Update existing item
				warehouse.items[existingIndex] = {
					...warehouse.items[existingIndex],
					quantity: item.newQuantity,
					lowStockThreshold:
						item.lowStockThreshold ?? warehouse.items[existingIndex].lowStockThreshold,
				};
			} else {
				// Add new item
				warehouse.items.push({
					id: nextItemId++,
					warehouseId: request.warehouseId,
					productId: item.productId,
					quantity: item.newQuantity,
					lowStockThreshold: item.lowStockThreshold ?? 0,
				});
			}
		});

		return {
			warehouseId: request.warehouseId,
			updatedItems: warehouse.items,
		};
	}
}

export default new WarehouseApi();
