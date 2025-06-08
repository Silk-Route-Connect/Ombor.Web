export type TemplateType = "supply" | "sale";

export type Template = {
	id: number;
	name: string;
	partnerName: string;
	partnerId: number;
	type: TemplateType;
	items: TemplateItem[];
};

export type TemplateItem = {
	id: number;
	productName: string;
	productId: number;
	quantity: number;
	unitPrice: number;
	discount?: number;
};

export type GetTemplatesRequest = {
	searchTerm?: string;
	type?: TemplateType;
};

export type GetTemplateByIdRequest = {
	id: number;
};

export type CreateTemplateRequest = {
	name: string;
	partnerId: number;
	type: TemplateType;
	items: CreateTemplateItemRequest[];
};

export type CreateTemplateItemRequest = {
	productId: number;
	quantity: number;
	unitPrice: number;
	discount?: number;
};

export type UpdateTemplateRequest = {
	id: number;
	name: string;
	partnerName: string;
	partnerId: number;
	type: TemplateType;
	items: UpdateTemplateItemRequest[];
};

export type UpdateTemplateItemRequest = {
	id: number;
	productName: string;
	productId: number;
	quantity: number;
	unitPrice: number;
	discount?: number;
};
