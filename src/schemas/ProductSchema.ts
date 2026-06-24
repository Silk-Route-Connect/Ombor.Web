import i18next from "i18n/config";
import { z } from "zod";

export const MEASUREMENTS = ["Gram", "Kilogram", "Ton", "Piece", "Box", "Unit", "None"] as const;
export type Measurement = (typeof MEASUREMENTS)[number];

export const PRODUCT_TYPES = ["All", "Sale", "Supply"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const requiredEnum = <T extends readonly string[]>(values: T, key: string) =>
	z.custom<T[number]>((v) => typeof v === "string" && (values as readonly string[]).includes(v), {
		message: i18next.t(key),
	});

const stripSpaces = (v: string): string => v.replace(/\s+/g, "");
const isAllDigits = (v: string): boolean => /^\d+$/.test(v);

const validateEan13 = (raw: string): boolean => {
	const v = stripSpaces(raw);
	if (v.length !== 13 || !isAllDigits(v)) return false;
	const nums = v.split("").map(Number);
	const check = nums.pop()!;
	const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 1 : 3), 0);
	return (10 - (sum % 10)) % 10 === check;
};

const validateEan8 = (raw: string): boolean => {
	const v = stripSpaces(raw);
	if (v.length !== 8 || !isAllDigits(v)) return false;
	const nums = v.split("").map(Number);
	const check = nums.pop()!;
	const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);
	return (10 - (sum % 10)) % 10 === check;
};

const validateUpcA = (raw: string): boolean => {
	const v = stripSpaces(raw);
	if (v.length !== 12 || !isAllDigits(v)) return false;
	const nums = v.split("").map(Number);
	const check = nums.pop()!;
	const sum = nums.reduce((acc, n, i) => acc + n * (i % 2 === 0 ? 3 : 1), 0);
	return (10 - (sum % 10)) % 10 === check;
};

const isValidBarcode = (v: string): boolean =>
	validateEan8(v) || validateUpcA(v) || validateEan13(v);

const optionalTrimmedMax = (max: number, key: string) =>
	z
		.string()
		.trim()
		.max(max, i18next.t(key))
		.transform((v) => (v === "" ? undefined : v))
		.optional();

export const ProductPackagingSchema = z.object({
	size: z
		.number()
		.refine(Number.isInteger, { message: i18next.t("product.validation.packSizeInvalid") })
		.min(2, i18next.t("product.validation.packSizeMin")),
	label: z
		.string()
		.trim()
		.max(50, i18next.t("product.validation.packLabelTooLong"))
		.transform((v) => (v === "" ? undefined : v))
		.optional(),
	barcode: z
		.string()
		.trim()
		.refine((v) => v === "" || isValidBarcode(v), {
			message: i18next.t("product.validation.invalidPackBarcode"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),
});

/**
 * Product form contract — aligned to the redesigned create/edit modal: only
 * Название and Артикул are required; Категория is optional (no default-category
 * concept — canon rule 42); prices are optional and merely non-negative. The
 * hidden price for the chosen type is zeroed by the form hook. `retailPrice` is
 * not part of this contract (dropped from create/edit; kept read-only on the
 * served model only). Initial stock is not captured here: a product is created
 * at zero stock and stocked later via an opening-stock event (canon rule 22,
 * Warehouse Detail) — see the session notes.
 */
export const ProductSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, i18next.t("product.validation.nameMin"))
		.max(250, i18next.t("product.validation.nameMax")),
	categoryId: z.number().int().positive().nullable(),
	measurement: requiredEnum(MEASUREMENTS, "product.validation.invalidMeasurement"),
	type: requiredEnum(PRODUCT_TYPES, "product.validation.invalidType"),
	sku: z
		.string()
		.trim()
		.min(1, i18next.t("product.validation.skuRequired"))
		.max(100, i18next.t("product.validation.skuTooLong")),
	description: optionalTrimmedMax(500, "product.validation.descriptionTooLong"),
	barcode: z
		.string()
		.trim()
		.refine((v) => v === "" || isValidBarcode(v), {
			message: i18next.t("product.validation.invalidBarcode"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),

	// Prices are non-negative; the type segmented control determines which are
	// shown, and the form hook zeroes the hidden one. retailPrice is not part of
	// the create/edit contract (kept read-only on the served model only).
	supplyPrice: z.number().min(0, i18next.t("product.validation.supplyPriceNonNegative")),
	salePrice: z.number().min(0, i18next.t("product.validation.salePriceNonNegative")),

	lowStockThreshold: z.number().int().min(0).nullable().optional(),

	// packaging is optional; when provided, size is required by ProductPackagingSchema
	packaging: ProductPackagingSchema.optional(),

	attachments: z
		.custom<
			File[] | undefined
		>((files): files is File[] | undefined => files === undefined || (Array.isArray(files) && files.every((f) => f instanceof File)))
		.optional(),
});

export type ProductFormInputs = z.input<typeof ProductSchema>;
export type ProductFormValues = z.output<typeof ProductSchema>;
