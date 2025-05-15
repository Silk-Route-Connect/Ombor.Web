export interface ProductDto {
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
}

export interface CreateProductRequest {
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
}

export interface UpdateProductRequest extends CreateProductRequest {
	id: number;
}
