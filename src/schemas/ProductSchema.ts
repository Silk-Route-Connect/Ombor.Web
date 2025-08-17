import { translate } from "i18n/i18n";
import { z } from "zod";

export const MEASUREMENTS = ["Gram", "Kilogram", "Liter", "Unit", "None"] as const;
export type Measurement = (typeof MEASUREMENTS)[number];

export const PRODUCT_TYPES = ["Sale", "Supply", "All"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

const requiredEnum = <T extends readonly string[]>(values: T, key: string) =>
	z.custom<T[number]>((v) => typeof v === "string" && (values as readonly string[]).includes(v), {
		message: translate(key),
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
		.max(max, translate(key))
		.transform((v) => (v === "" ? undefined : v))
		.optional();

export const ProductPackagingSchema = z.object({
	packSize: z
		.number()
		.refine(Number.isInteger, { message: translate("product.validation.packSizeInvalid") })
		.min(2, translate("product.validation.packSizeMin")),
	packLabel: z
		.string()
		.trim()
		.max(50, translate("product.validation.packLabelTooLong"))
		.transform((v) => (v === "" ? undefined : v))
		.optional(),
	packBarcode: z
		.string()
		.trim()
		.refine((v) => v === "" || isValidBarcode(v), {
			message: translate("product.validation.invalidPackBarcode"),
		})
		.transform((v) => (v === "" ? undefined : v))
		.optional(),
});

export const ProductSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(2, translate("product.validation.nameMin"))
			.max(250, translate("product.validation.nameMax")),
		categoryId: z
			.number()
			.refine(Number.isInteger, { message: translate("product.validation.categoryRequired") })
			.min(1, translate("product.validation.categoryRequired")),
		measurement: requiredEnum(MEASUREMENTS, "product.validation.invalidMeasurement"),
		type: requiredEnum(PRODUCT_TYPES, "product.validation.invalidType"),
		sku: z
			.string()
			.trim()
			.min(1, translate("product.validation.skuRequired"))
			.max(100, translate("product.validation.skuTooLong")),
		description: optionalTrimmedMax(500, "product.validation.descriptionTooLong"),
		barcode: z
			.string()
			.trim()
			.refine((v) => v === "" || isValidBarcode(v), {
				message: translate("product.validation.invalidBarcode"),
			})
			.transform((v) => (v === "" ? undefined : v))
			.optional(),

		// prices (validated below with chained rules)
		supplyPrice: z.number(),
		salePrice: z.number(),
		retailPrice: z.number(),

		// packaging is optional; when provided, packSize is required by ProductPackagingSchema
		packaging: ProductPackagingSchema.optional(),

		attachments: z
			.custom<
				File[] | undefined
				// eslint-disable-next-line max-len
			>(
				(files): files is File[] | undefined =>
					files === undefined || (Array.isArray(files) && files.every((f) => f instanceof File)),
			)
			.optional(),

		notes: optionalTrimmedMax(500, "product.validation.notesTooLong"),
	})

	// Non-negativity
	.refine((d) => d.supplyPrice >= 0, {
		path: ["supplyPrice"],
		message: translate("product.validation.supplyPriceNonNegative"),
	})
	.refine((d) => d.salePrice >= 0, {
		path: ["salePrice"],
		message: translate("product.validation.salePriceNonNegative"),
	})
	.refine((d) => d.retailPrice >= 0, {
		path: ["retailPrice"],
		message: translate("product.validation.retailPriceNonNegative"),
	})

	// Type: Sale → sale>0, retail>0
	.refine((d) => d.type !== "Sale" || d.salePrice > 0, {
		path: ["salePrice"],
		message: translate("product.validation.salePricePositive"),
	})
	.refine((d) => d.type !== "Sale" || d.retailPrice > 0, {
		path: ["retailPrice"],
		message: translate("product.validation.retailPricePositive"),
	})

	// Type: Supply → supply>0, sale==0, retail==0
	.refine((d) => d.type !== "Supply" || d.supplyPrice > 0, {
		path: ["supplyPrice"],
		message: translate("product.validation.supplyPricePositive"),
	})
	.refine((d) => d.type !== "Supply" || d.salePrice === 0, {
		path: ["salePrice"],
		message: translate("product.validation.salePriceMustBeZero"),
	})
	.refine((d) => d.type !== "Supply" || d.retailPrice === 0, {
		path: ["retailPrice"],
		message: translate("product.validation.retailPriceMustBeZero"),
	})

	// Cross-price comparisons when not Supply
	.refine((d) => d.type === "Supply" || d.salePrice > d.supplyPrice, {
		path: ["salePrice"],
		message: translate("product.validation.saleGreaterThanSupply"),
	})
	.refine((d) => d.type === "Supply" || d.retailPrice > d.supplyPrice, {
		path: ["retailPrice"],
		message: translate("product.validation.retailGreaterThanSupply"),
	})
	.refine((d) => d.type === "Supply" || d.salePrice > d.retailPrice, {
		path: ["salePrice"],
		message: translate("product.validation.saleGreaterThanRetail"),
	});

export type ProductFormInputs = z.input<typeof ProductSchema>;
export type ProductFormValues = z.output<typeof ProductSchema>;
