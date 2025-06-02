export type Product = {
	id: number;
	categoryId: number;
	categoryName: string;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;
	salePrice: number;
	supplyPrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	isLowStock: boolean;
	measurement: Measurement;
	type: ProductType;
	images: ProductImage[];
};

export type CreateProductRequest = {
	categoryId: number;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;
	supplyPrice: number;
	salePrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	measurement: Measurement;
	type: ProductType;
	attachments?: File[];
};

export type UpdateProductRequest = CreateProductRequest & {
	id: number;
	imagesToDelete?: number[]; // IDs of images to delete
};

export type GetProductsRequest = {
	searchTerm?: string;
	categoryId?: number;
};

export type Measurement = "Gram" | "Kilogram" | "Ton" | "Piece" | "Box" | "Unit" | "None";

export type ProductType = "Sale" | "Supply" | "All";

export type ProductImage = {
	id: number;
	name: string;
	originalUrl: string;
	thumbnailUrl?: string;
};
