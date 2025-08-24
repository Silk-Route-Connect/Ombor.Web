import { TransactionType } from "./transaction";

export const PRODUCT_MEASUREMENTS = ["Unit", "Gram", "Kilogram", "Liter", "None"] as const;
export type Measurement = (typeof PRODUCT_MEASUREMENTS)[number];

export const PRODUCT_TYPES = ["All", "Sale", "Supply"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export type ProductImage = {
	id: number;
	name: string;
	originalUrl: string;
	thumbnailUrl?: string;
};

export type ProductPackaging = {
	packSize: number;
	packLabel?: string;
	packBarcode?: string;
};

export type Product = {
	id: number;
	categoryId: number;
	categoryName: string;
	name: string;
	sku: string;
	description?: string;
	barcode?: string;

	supplyPrice: number;
	salePrice: number;
	retailPrice: number;

	measurement: Measurement;
	type: ProductType;

	images: ProductImage[];
	packaging?: ProductPackaging;
	notes?: string;
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

	measurement: Measurement;
	type: ProductType;

	packaging?: ProductPackaging;

	attachments?: File[];
	notes?: string;
};

export type UpdateProductRequest = CreateProductRequest & {
	id: number;
	imagesToDelete?: number[];
};

export type GetProductsRequest = {
	searchTerm?: string;
	categoryId?: number;
	type?: ProductType;
};

export type ProductTransaction = {
	id: number;
	productId: number;
	transactionType: TransactionType;
	partnerId: number;
	partnerName: string;
	date: Date;
	quantity: number;
	unitPrice: number;
	discount: number;
};
