export type Partner = {
	id: number;
	name: string;
	type: PartnerType;
	address?: string;
	email?: string;
	phoneNumbers: string[];
	companyName?: string;

	/**
	 * Partner’s running balance **relative to the company**.
	 *
	 * * `< 0`  – partner owes the company (company is creditor)
	 * * `> 0`  – company owes the partner (partner has credit)
	 * * `=== 0` – all settled
	 *
	 * All arithmetic is in local currency (UZS).
	 */
	balance: number;
};

export type PartnerType = "Customer" | "Supplier" | "Both";

export type CreatePartnerRequest = Omit<Partner, "id">;

export type UpdateParatnerRequest = CreatePartnerRequest & {
	id: number;
};

export type GetPartnersRequest = {
	searchTerm?: string;
	type?: PartnerType;
};
