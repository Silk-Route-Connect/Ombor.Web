export type Partner = {
	id: number;
	name: string;
	type: PartnerType;
	address?: string;
	email?: string;
	phoneNumbers: string[];
	companyName?: string;
	balance: number;
};

export type PartnerType = "Customer" | "Supplier" | "All";

export type CreatePartnerRequest = Omit<Partner, "id">;

export type UpdateParatnerRequest = CreatePartnerRequest & {
	id: number;
};

export type GetPartnersRequest = {
	searchTerm?: string;
	type?: PartnerType;
};
