import { initReactI18next } from "react-i18next";
import i18next from "i18next";

import authRu from "./ru/auth.json";
import categoryRu from "./ru/category.json";
import commonRu from "./ru/common.json";
import employeeRu from "./ru/employee.json";
import orderRu from "./ru/order.json";
import partnerRu from "./ru/partner.json";
import paymentRu from "./ru/payment.json";
import payrollRu from "./ru/payroll.json";
import productRu from "./ru/product.json";
import stockAdjustmentRu from "./ru/stockAdjustment.json";
import supplierRu from "./ru/supplier.json";
import supplyRu from "./ru/supply.json";
import templateRu from "./ru/template.json";
import transactionRu from "./ru/transaction.json";
import transferRu from "./ru/transfer.json";
import warehouseRu from "./ru/warehouse.json";
import authUz from "./uz/auth.json";
import categoryUz from "./uz/category.json";
import commonUz from "./uz/common.json";
import employeeUz from "./uz/employee.json";
import payrollUz from "./uz/payroll.json";
import productUz from "./uz/product.json";
import supplierUz from "./uz/supplier.json";
import supplyUz from "./uz/supply.json";
import templateUz from "./uz/template.json";

export const SUPPORTED_LOCALES = ["ru", "uz", "uz-Cyrl"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_STORAGE_KEY = "ombor.locale";

function getStoredLocale(): Locale {
	const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
	return (SUPPORTED_LOCALES as readonly string[]).includes(stored ?? "")
		? (stored as Locale)
		: "ru";
}

/**
 * Existing keys are flat strings with literal dots ("category.title" and
 * "category.title.create" coexist), resolved against a single per-locale map
 * merged from all module files. Replicated here: one merged "translation"
 * namespace per language, keySeparator/nsSeparator disabled. Per-module
 * namespaces come as modules are rewritten (docs/conventions.md, i18n).
 */
const resources = {
	ru: {
		translation: {
			...categoryRu,
			...productRu,
			...supplierRu,
			...supplyRu,
			...commonRu,
			...templateRu,
			...transactionRu,
			...paymentRu,
			...partnerRu,
			...authRu,
			...employeeRu,
			...payrollRu,
			...warehouseRu,
			...stockAdjustmentRu,
			...transferRu,
			...orderRu,
		},
	},
	uz: {
		translation: {
			...categoryUz,
			...productUz,
			...supplierUz,
			...supplyUz,
			...commonUz,
			...templateUz,
			...authUz,
			...employeeUz,
			...payrollUz,
		},
	},
	// Registered for wiring only — translation backfill is a later pass.
	"uz-Cyrl": {
		translation: {},
	},
};

i18next.use(initReactI18next).init({
	resources,
	lng: getStoredLocale(),
	fallbackLng: "ru",
	supportedLngs: [...SUPPORTED_LOCALES],
	// Keys contain literal dots and no namespace prefixes — disable both separators.
	keySeparator: false,
	nsSeparator: false,
	interpolation: {
		escapeValue: false, // React already escapes
	},
	// Resources are inline — init synchronously so module-level i18next.t
	// calls (schemas, table configs) resolve during import, as before.
	initAsync: false,
});

i18next.on("languageChanged", (lng) => {
	localStorage.setItem(LOCALE_STORAGE_KEY, lng);
});

export default i18next;
