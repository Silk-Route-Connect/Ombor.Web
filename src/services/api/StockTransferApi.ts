import {
	CreateStockTransferRequest,
	GetStockTransfersRequest,
	StockTransfer,
} from "models/stockTransfer";

import BaseApi from "./BaseApi";

// Mock data
const mockTransfers: StockTransfer[] = [
	{
		id: 1,
		createdAt: new Date("2025-01-18T11:00:00"),
		fromWarehouseId: 1,
		fromWarehouseName: "Main Warehouse",
		toWarehouseId: 2,
		toWarehouseName: "Retail Store",
		productsCount: 2,
		totalQuantity: 30,
		userId: 1,
		userName: "Admin User",
		notes: "Restocking retail store",
		items: [
			{
				productId: 1,
				productName: "Product A",
				productSku: "SKU-001",
				quantity: 20,
			},
			{
				productId: 2,
				productName: "Product B",
				productSku: "SKU-002",
				quantity: 10,
			},
		],
	},
	{
		id: 2,
		createdAt: new Date("2025-01-19T15:30:00"),
		fromWarehouseId: 2,
		fromWarehouseName: "Retail Store",
		toWarehouseId: 1,
		toWarehouseName: "Main Warehouse",
		productsCount: 1,
		totalQuantity: 5,
		userId: 1,
		userName: "Admin User",
		notes: null,
		items: [
			{
				productId: 4,
				productName: "Product D",
				productSku: "SKU-004",
				quantity: 5,
			},
		],
	},
];

let nextTransferId = 3;

class StockTransferApi extends BaseApi {
	constructor() {
		super("warehouses/transfers");
	}

	async getAll(request?: GetStockTransfersRequest | null): Promise<StockTransfer[]> {
		await new Promise((resolve) => setTimeout(resolve, 300));

		let transfers = [...mockTransfers];

		if (request?.fromWarehouseId) {
			transfers = transfers.filter((t) => t.fromWarehouseId === request.fromWarehouseId);
		}

		if (request?.toWarehouseId) {
			transfers = transfers.filter((t) => t.toWarehouseId === request.toWarehouseId);
		}

		// Sort by date descending (newest first)
		transfers.sort((a, b) => {
			const dateA = new Date(a.createdAt).getTime();
			const dateB = new Date(b.createdAt).getTime();
			return dateB - dateA;
		});

		return transfers;
	}

	async create(request: CreateStockTransferRequest): Promise<StockTransfer> {
		await new Promise((resolve) => setTimeout(resolve, 400));

		// In real implementation, backend would fetch product details
		const items = request.items.map((item) => ({
			productId: item.productId,
			productName: `Product ${item.productId}`, // Mock
			productSku: `SKU-${String(item.productId).padStart(3, "0")}`, // Mock
			quantity: item.quantity,
		}));

		const newTransfer: StockTransfer = {
			id: nextTransferId++,
			createdAt: new Date(),
			fromWarehouseId: request.fromWarehouseId,
			fromWarehouseName: `Warehouse ${request.fromWarehouseId}`, // Mock name
			toWarehouseId: request.toWarehouseId,
			toWarehouseName: `Warehouse ${request.toWarehouseId}`, // Mock name
			productsCount: request.items.length,
			totalQuantity: request.items.reduce((sum, item) => sum + item.quantity, 0),
			userId: 1, // Mock user
			userName: "Admin User", // Mock user
			notes: request.notes ?? null,
			items,
		};

		mockTransfers.push(newTransfer);
		return newTransfer;
	}
}

export default new StockTransferApi();
