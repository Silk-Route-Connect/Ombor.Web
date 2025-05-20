export type Product = {
	id: number;
	categoryId: number;
	categoryName: string;
	name: string;
	sku: string;
	measurement: Measurement;
	description?: string;
	barcode?: string;
	salePrice: number;
	supplyPrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	isLowStock: boolean;
};

export type CreateProductRequest = {
	categoryId: number;
	name: string;
	sku: string;
	measurement: Measurement;
	description?: string;
	barcode?: string;
	supplyPrice: number;
	salePrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
};

export type UpdateProductRequest = CreateProductRequest & {
	id: number;
};

export type GetProductsRequest = {
	searchTerm?: string;
	categoryId?: number;
};

export type Measurement = "Gram" | "Kilogram" | "Ton" | "Piece" | "Box" | "Unit" | "None";
