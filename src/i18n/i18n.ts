import categoryRu from "./ru/category.json";
import commonRu from "./ru/common.json";
import employeeRu from "./ru/employee.json";
import partnerRu from "./ru/partner.json";
import paymentRu from "./ru/payment.json";
import productRu from "./ru/product.json";
import supplierRu from "./ru/supplier.json";
import supplyRu from "./ru/supply.json";
import templateRu from "./ru/template.json";
import transactionRu from "./ru/transaction.json";

import categoryUz from "./uz/category.json";
import commonUz from "./uz/common.json";
import employeeUz from "./uz/employee.json";
import productUz from "./uz/product.json";
import supplierUz from "./uz/supplier.json";
import supplyUz from "./uz/supply.json";
import templateUz from "./uz/template.json";

export type Locale = "ru" | "uz";

const messages: Record<Locale, Record<string, string>> = {
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
		...employeeRu,
	},
	uz: {
		...categoryUz,
		...productUz,
		...supplierUz,
		...supplyUz,
		...commonUz,
		...templateUz,
		...employeeUz,
	},
};

let currentLocale: Locale = "ru";

/**
 * Switch the current locale.
 * @param locale one of "ru" | "uz"
 */
export function setLocale(locale: Locale) {
	if (messages[locale]) {
		currentLocale = locale;
	} else {
		console.warn(`Unsupported locale: ${locale}`);
	}
}

/**
 * Translate a key to the current locale.
 * Falls back to the key itself if no translation is found.
 * @param key the translation key, e.g. "createProductSuccess"
 */
export function translate(key: string): string {
	const localeMessages = messages[currentLocale];
	return localeMessages[key] ?? key;
}

/**
 * Get the list of supported locales.
 */
export function getSupportedLocales(): Locale[] {
	return Object.keys(messages) as Locale[];
}
