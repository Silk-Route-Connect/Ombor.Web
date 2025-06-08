export type Supply = {
	id: number;
	supplierName: string;
	supplierId: number;
	date: Date;
	totalDue: number;
	totalPaid: number;
	items: SupplyItem[];
	notes?: string;
	attachments?: File[];
	paymentType: "cash" | "card";
	currency: "uzs" | "usd" | "rub";
	exchangeRate?: number;
};

export type SupplyItem = {
	id: number;
	productId: number;
	productName?: string;
	quantity: number;
	unitPrice: number;
	totalPrice?: number;
	discount?: number;
};

export type CreateSupplyItem = Omit<SupplyItem, "id">;

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

export type CreateSupplyRequest = {
	supplierId: number;
	date: Date;
	items: SupplyItem[];
	notes?: string;
};

export type UpdateSupplyRequest = {
	id: number;
	supplierId?: number;
	date?: Date;
	items?: SupplyItem[];
	notes?: string;
};
