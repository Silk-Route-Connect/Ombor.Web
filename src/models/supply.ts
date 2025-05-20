export type Supply = {
	id: number;
	supplierName: string;
	supplierId: number;
	date: Date;
	items: SupplyItem[];
};

export type SupplyItem = {
	id: number;
	productId: number;
	quantity: number;
	unitPrice: number;
};
