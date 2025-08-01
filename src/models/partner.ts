export type Partner = {
	id: number;
	type: PartnerType;
	name: string;
	phoneNumbers: string[];
	address?: string;
	email?: string;
	companyName?: string;
	balance: number;
	balanceDto: PartnerBalance | null;
};

export type PartnerBalance = {
	total: number;
	partnerAdvance: number;
	companyAdvance: number;
	payableDebt: number;
	receivableDebt: number;
};

export type PartnerType = "Customer" | "Supplier" | "Both";

export type CreatePartnerRequest = {
	name: string;
	phoneNumbers: string[];
	address?: string;
	email?: string;
	companyName?: string;
	balance: number;
	isActive: boolean;
	type: PartnerType;
};

export type UpdatePartnerRequest = CreatePartnerRequest & {
	id: number;
};

export type GetPartnersRequest = {
	searchTerm?: string;
	type?: PartnerType;
};
