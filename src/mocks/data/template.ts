import {
	CreateTemplateRequest,
	Template,
	TemplateItem,
	TemplateType,
	UpdateTemplateRequest,
} from "../../models/template";
import { findPartner } from "./partner";
import { findProduct } from "./product";

/**
 * In-memory seed + mutation for the Templates mock. A template is a reusable,
 * editable basket of products tied to one partner, typed Sale | Supply, that
 * loads its lines + prices into a new transaction in one click (mvp-plan §12).
 * No money or stock is affected by a template.
 *
 * The live `/api/templates` contract exists but its `TemplateDto` is stale
 * relative to the redesign — it carries no last-used date (the «Использован»
 * column) and its items carry no SKU / unit for the expand-row — so the whole
 * resource is mocked here at the target v1 contract (docs/mocking.md).
 * Mutations persist within a session and reset on reload.
 *
 * Cross-module consistency (seed-data rule 5): every line references a real
 * product (Products mock) and every template references a real partner
 * (Partners mock); product name / SKU / unit and the partner name are resolved
 * from the served data so the screens never drift. Loading a template does NOT
 * mutate Products stock — a known mock limitation, consistent with transfers
 * and adjustments.
 */

const BASE = new Date(2026, 5, 6); // 06.06.2026 — the seed "today"
const MS_PER_DAY = 86_400_000;
const isoDaysAgo = (days: number): string =>
	new Date(BASE.getTime() - days * MS_PER_DAY).toISOString();

/** A seed line: a real product id + quantity. Price/sku/unit are resolved live. */
type LineSpec = { productId: number; quantity: number };

type TemplateSeed = {
	name: string;
	type: TemplateType;
	partnerId: number;
	/** Days before BASE the template was last loaded, or null if never used. */
	lastUsedDaysAgo: number | null;
	lines: LineSpec[];
};

const seed: TemplateSeed[] = [
	{
		name: "Еженедельная поставка Виктории",
		type: "Sale",
		partnerId: 4, // Виктория (Customer)
		lastUsedDaysAgo: 0,
		lines: [
			{ productId: 8, quantity: 25 },
			{ productId: 9, quantity: 10 },
			{ productId: 13, quantity: 50 },
			{ productId: 6, quantity: 8 },
			{ productId: 3, quantity: 15 },
			{ productId: 1, quantity: 5 },
		],
	},
	{
		name: "Базовый заказ Орехников",
		type: "Sale",
		partnerId: 3, // Артём Орехников (Both)
		lastUsedDaysAgo: 5,
		lines: [
			{ productId: 2, quantity: 10 },
			{ productId: 6, quantity: 18 },
			{ productId: 7, quantity: 5 },
			{ productId: 17, quantity: 10 },
		],
	},
	{
		name: "Закупка у Вероники",
		type: "Supply",
		partnerId: 5, // Вероника (Supplier)
		lastUsedDaysAgo: 4,
		lines: [
			{ productId: 1, quantity: 30 },
			{ productId: 4, quantity: 40 },
			{ productId: 5, quantity: 20 },
			{ productId: 2, quantity: 20 },
			{ productId: 3, quantity: 25 },
		],
	},
	{
		name: "Стандарт Парфёнова",
		type: "Supply",
		partnerId: 2, // Парфёнова (Supplier)
		lastUsedDaysAgo: 12,
		lines: [
			{ productId: 11, quantity: 10 },
			{ productId: 12, quantity: 20 },
			{ productId: 18, quantity: 20 },
		],
	},
	{
		name: "Ежемесячный заказ Каримова",
		type: "Supply",
		partnerId: 9, // Фарход Каримов (Supplier)
		lastUsedDaysAgo: null,
		lines: [
			{ productId: 15, quantity: 12 },
			{ productId: 13, quantity: 8 },
		],
	},
];

/** Resolve a seed/request line into a served TemplateItem (price by template type). */
function buildItem(id: number, type: TemplateType, line: LineSpec, price?: number): TemplateItem {
	const product = findProduct(line.productId);
	const unitPrice =
		price ?? (type === "Sale" ? (product?.salePrice ?? 0) : (product?.supplyPrice ?? 0));

	return {
		id,
		productId: line.productId,
		productName: product?.name ?? `#${line.productId}`,
		sku: product?.sku ?? "—",
		measurement: product?.measurement ?? "Unit",
		quantity: line.quantity,
		unitPrice,
		discount: 0,
		// The real `TemplateItemDto` always serves a discountType; the backend defaults
		// a write to `Fixed`, so the mock mirrors that (contract: orders-templates.md).
		discountType: "Fixed",
	};
}

const sumTotal = (items: TemplateItem[]): number =>
	items.reduce((acc, it) => acc + it.quantity * it.unitPrice * (1 - (it.discount ?? 0) / 100), 0);

function build(id: number, spec: TemplateSeed): Template {
	const items = spec.lines.map((line, index) => buildItem(index + 1, spec.type, line));

	return {
		id,
		name: spec.name,
		partnerId: spec.partnerId,
		partnerName: findPartner(spec.partnerId)?.name ?? `#${spec.partnerId}`,
		type: spec.type,
		total: sumTotal(items),
		lastUsedAt: spec.lastUsedDaysAgo == null ? null : isoDaysAgo(spec.lastUsedDaysAgo),
		items,
	};
}

let templates: Template[] = seed.map((spec, index) => build(index + 1, spec));
let nextId = templates.length + 1;
let nextItemId = 1000;

/** Filtered list: search matches name or partner; type narrows Sale / Supply. */
export function listTemplates(searchTerm?: string | null, type?: TemplateType | null): Template[] {
	let result = [...templates];

	if (type) {
		result = result.filter((tpl) => tpl.type === type);
	}

	const term = searchTerm?.trim().toLowerCase();
	if (term) {
		result = result.filter(
			(tpl) =>
				tpl.name.toLowerCase().includes(term) || tpl.partnerName.toLowerCase().includes(term),
		);
	}

	return result;
}

export function findTemplate(id: number): Template | undefined {
	return templates.find((tpl) => tpl.id === id);
}

function itemsFromRequest(
	type: TemplateType,
	rawItems: CreateTemplateRequest["items"],
): TemplateItem[] {
	return (rawItems ?? []).map((item) =>
		buildItem(
			nextItemId++,
			type,
			{ productId: item.productId, quantity: item.quantity },
			item.unitPrice,
		),
	);
}

export function addTemplate(request: CreateTemplateRequest): Template {
	const items = itemsFromRequest(request.type, request.items);
	const created: Template = {
		id: nextId++,
		name: request.name ?? "",
		partnerId: request.partnerId,
		partnerName: findPartner(request.partnerId)?.name ?? `#${request.partnerId}`,
		type: request.type,
		total: sumTotal(items),
		lastUsedAt: null,
		items,
	};
	templates = [created, ...templates];

	return created;
}

export function updateTemplate(id: number, request: UpdateTemplateRequest): Template | undefined {
	const existing = findTemplate(id);
	if (!existing) {
		return undefined;
	}

	const items = itemsFromRequest(request.type, request.items);
	const updated: Template = {
		...existing,
		name: request.name ?? "",
		partnerId: request.partnerId,
		partnerName: findPartner(request.partnerId)?.name ?? `#${request.partnerId}`,
		type: request.type,
		total: sumTotal(items),
		items,
	};
	templates = templates.map((tpl) => (tpl.id === id ? updated : tpl));

	return updated;
}

export function deleteTemplate(id: number): boolean {
	const existed = templates.some((tpl) => tpl.id === id);
	templates = templates.filter((tpl) => tpl.id !== id);

	return existed;
}
