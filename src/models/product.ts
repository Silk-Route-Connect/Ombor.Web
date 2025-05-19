export type ProductDto = {
	id: number;
	categoryId: number;
	categoryName: string;
	name: string;
	sku: string;
	measurement: string;
	description?: string;
	barcode?: string;
	salePrice: number;
	supplyPrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	expireDate?: string; // use ISO string, e.g. "2025-06-01"
	isLowStock: boolean;
	isExpirationClose: boolean;
};

export type CreateProductRequest = {
	categoryId: number;
	name: string;
	sku: string;
	measurement: string;
	description?: string;
	barcode?: string;
	supplyPrice: number;
	salePrice: number;
	retailPrice: number;
	quantityInStock: number;
	lowStockThreshold: number;
	expireDate?: string;
};

export type UpdateProductRequest = CreateProductRequest & {
	id: number;
};

export type GetProductsRequest = {
	searchTerm?: string;
	categoryId?: number;
};
