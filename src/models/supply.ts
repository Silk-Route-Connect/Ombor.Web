export type Supply = {
	id: number;
	supplierName: string;
	supplierId: number;
	date: Date;
	totalDue: number;
	totalPaid: number;
	items: SupplyItem[];
	notes?: string;
};

export type SupplyItem = {
	id: number;
	productId: number;
	productName?: string;
	quantity: number;
	unitPrice: number;
	totalPrice?: number;
};

export type SupplyPayment = {
	id: number;
	supplyId: number;
	date: Date;
	amount: number;
};

export type GetSuppliesRequest = {
	supplierId?: number;
	from?: Date;
	to?: Date;
};
