import categoryRu from "./ru/category.json";
import commonRu from "./ru/common.json";
import partnerRu from "./ru/partner.json";
import paymentRu from "./ru/payment.json";
import productRu from "./ru/product.json";
import supplierRu from "./ru/supplier.json";
import supplyRu from "./ru/supply.json";
import templateRu from "./ru/template.json";
import transactionRu from "./ru/transaction.json";
import categoryUz from "./uz/category.json";
import commonUz from "./uz/common.json";
import productUz from "./uz/product.json";
import supplierUz from "./uz/supplier.json";
import supplyUz from "./uz/supply.json";
import templateUz from "./uz/template.json";

/**
 * Supported locales for translations.
 * Currently supports "ru" (Russian) and "uz" (Uzbek).
 * Extend this type if you add more locales.
 */
export type Locale = "ru" | "uz";

/**
 * Runtime parameters that can be injected into the translation string.
 * Numeric values are converted to strings. If you need richer types,
 * extend this union.
 */
export type InterpolationParams = Record<string, string | number>;

type MessagesMap<T extends string = string> = Record<Locale, Record<string, T>>;

const messages: MessagesMap = {
	ru: {
		...categoryRu,
		...productRu,
		...supplierRu,
		...supplyRu,
		...commonRu,
		...templateRu,
		...transactionRu,
		...paymentRu,
		...partnerRu,
	},
	uz: {
		...categoryUz,
		...productUz,
		...supplierUz,
		...supplyUz,
		...commonUz,
		...templateUz,
	},
};

let currentLocale: Locale = "ru";

export function getLocale(): Locale {
	return currentLocale;
}

/**
 * Switch the current locale.
 * @param locale "ru" | "uz"
 */
export function setLocale(locale: Locale) {
	if (messages[locale]) {
		currentLocale = locale;
	} else {
		console.warn(`Unsupported locale: ${locale}`);
	}
}

/**
 * Translate a key into the current locale. Supports {{placeholders}}.
 *
 * @example
 * translate("category.deleteConfirmationTitle",
 *           { categoryName: "Фрукты" });
 */
export function translate(key: string, params?: InterpolationParams): string {
	const template = messages[currentLocale][key] ?? key;

	if (!params || template.indexOf("{{") === -1) {
		return template;
	}

	return template.replace(/{{\s*(\w+)\s*}}/g, (_, token: string) => {
		if (Object.hasOwn(params, token)) {
			return String(params[token]);
		}

		return "";
	});
}

/**
 * Get the list of supported locales.
 */
export function getSupportedLocales(): Locale[] {
	return Object.keys(messages) as Locale[];
}
