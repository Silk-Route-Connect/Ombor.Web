export type Sale = {
	id: number;
	customerName: string;
	customerId: number;
	date: Date;
	items: SaleItem[];
};

export type SaleItem = {
	id: number;
	productId: number;
	quantity: number;
	unitPrice: number;
};
