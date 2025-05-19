import categoryRu from "./ru/category.json";
import productRu from "./ru/product.json";
import categoryUz from "./uz/category.json";
import productUz from "./uz/product.json";

export type Locale = "ru" | "uz";

const messages: Record<Locale, Record<string, string>> = {
	ru: { ...categoryRu, ...productRu },
	uz: { ...categoryUz, ...productUz },
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
