export type Supplier = {
	id: number;
	name: string;
	address?: string;
	email?: string;
	phoneNumbers: string[];
	companyName?: string;
	isActive: boolean;
	balance: number;
};

export type CreateSupplierRequest = Omit<Supplier, "id">;

export type UpdateSupplierRequest = CreateSupplierRequest & {
	id: number;
};

export type GetSuppliersRequest = {
	searchTerm?: string;
};
