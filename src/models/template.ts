import { Measurement } from "./product";
import { TransactionLineDiscountType as DiscountType } from "./transaction";

export const TEMPLATE_TYPES = ["Supply", "Sale"] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export type Template = {
	id: number;
	name: string;
	partnerName: string;
	partnerId: number;
	total: number;
	type: TemplateType;
	/**
	 * When the template was last loaded into a transaction (ISO date) or null if
	 * never used. The redesigned list shows it as the «Использован» column; the
	 * live backend `TemplateDto` does not carry it yet, so the resource is mocked
	 * at the target v1 contract (docs/mocking.md).
	 */
	lastUsedAt: string | null;
	items: TemplateItem[];
};

export type TemplateItem = {
	id: number;
	productName: string;
	productId: number;
	/** Served product article + unit (mock-enriched from the catalogue) for the expand-row. */
	sku: string;
	measurement: Measurement;
	quantity: number;
	unitPrice: number;
	discount: number;
	/**
	 * Whether `discount` is a percentage or a fixed amount. The backend serves it on
	 * every `TemplateItemDto` and **defaults it to `Fixed`** when a write omits it
	 * (orders-templates.md), so the display math must branch on it — a Fixed discount
	 * treated as a percentage renders an absurd negative total.
	 */
	discountType: DiscountType;
	/**
	 * When the item was entered in packages, the package size snapshotted at entry
	 * time (F21); null/absent for a base-unit item. The entered pack count is derived
	 * as `quantity ÷ packageSize`.
	 */
	packageSize?: number | null;
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
	/** Percentage vs fixed amount; the backend defaults it to `Fixed` when omitted. */
	discountType: DiscountType;
	/**
	 * Pack count when the item was entered in packages (F21). When set, the server
	 * computes the base `quantity` from the product's package size and snapshots it.
	 */
	packageQuantity?: number;
};

export type UpdateTemplateRequest = {
	id: number;
	name: string;
	partnerId: number;
	type: TemplateType;
	items: UpdateTemplateItemRequest[];
};

export type UpdateTemplateItemRequest = {
	id: number;
	productId: number;
	quantity: number;
	unitPrice: number;
	discount?: number;
	/** Percentage vs fixed amount; the backend defaults it to `Fixed` when omitted. */
	discountType: DiscountType;
	/**
	 * Pack count when the item was entered in packages (F21). When set, the server
	 * computes the base `quantity` from the product's package size and snapshots it.
	 */
	packageQuantity?: number;
};
