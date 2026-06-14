import { Partner, PartnerType } from "models/partner";
import { PartnerFormInputs } from "schemas/PartnerSchema";

export const PARTNER_TYPES = ["Customer", "Supplier", "Both"] as const;

/**
 * MUI palette path for a balance figure, by the app-wide sign convention:
 * + (partner owes us) → success, − (we owe) → error, 0 → muted. Returns an `sx`
 * `color` token so it composes into any styled value.
 */
export const balanceColor = (balance: number): string => {
	if (balance < 0) {
		return "error.main";
	}
	if (balance > 0) {
		return "success.main";
	}
	return "text.secondary";
};

/** Legacy alias kept for components that still import it. */
export const getBalanceColor = (balance: number): string => {
	if (balance < 0) {
		return "error.main";
	}
	if (balance > 0) {
		return "success.main";
	}
	return "text.primary";
};

/**
 * i18n key for the natural-language balance label (locked pattern 4 — no signs):
 * «Нам должны» / «Мы должны» / «Расчёты закрыты».
 */
export const balanceLabelKey = (balance: number): string => {
	if (balance > 0) {
		return "partner.balance.receivableLabel";
	}
	if (balance < 0) {
		return "partner.balance.payableLabel";
	}
	return "partner.balance.zeroLabel";
};

export const emptyPartnerFormDefaults: PartnerFormInputs = {
	type: "Customer",
	name: "",
	companyName: "",
	address: "",
	email: "",
	telegram: "",
	phoneNumbers: [""],
	openingType: "receivable",
	openingAmount: 0,
};

export const mapPartnerToFormPayload = (partner: Partner): PartnerFormInputs => ({
	type: partner.type,
	name: partner.name,
	companyName: partner.companyName ?? "",
	address: partner.address ?? "",
	email: partner.email ?? "",
	telegram: partner.telegram ?? "",
	phoneNumbers: mapPhoneNumbers(partner.phoneNumbers),
	// Opening balance is locked on edit; defaults are inert (the form hides the inputs).
	openingType: partner.openingBalance < 0 ? "payable" : "receivable",
	openingAmount: Math.abs(partner.openingBalance),
});

// Render at least one phone input even when the partner has none.
const mapPhoneNumbers = (phoneNumbers: string[]): string[] =>
	phoneNumbers.length > 0 ? phoneNumbers : [""];

/** Up to two uppercase initials from a name, for avatars. */
export const getInitials = (name: string): string =>
	name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");

export const canHaveSales = (type: PartnerType): boolean => type === "Customer" || type === "Both";

export const canHaveSupplies = (type: PartnerType): boolean =>
	type === "Supplier" || type === "Both";
