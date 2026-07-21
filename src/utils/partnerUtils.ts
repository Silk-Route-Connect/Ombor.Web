import { Partner, PartnerType } from "models/partner";
import { PartnerFormInputs } from "schemas/PartnerSchema";
import { formatSigned } from "utils/formatCurrency";

export const PARTNER_TYPES = ["Customer", "Supplier", "Both"] as const;

/**
 * MUI palette token for a partner-account balance, shown from the PARTNER's
 * perspective: a debt they owe us reads negative → error (red); money we owe
 * them reads positive → success (green); settled → muted. The served value stays
 * company-POV (+ = partner owes us) — this only flips the presentation.
 */
export const partnerBalanceColor = (balance: number): string => {
	if (balance > 0) {
		return "error.main";
	}
	if (balance < 0) {
		return "success.main";
	}
	return "text.secondary";
};

/**
 * Signed partner-account presentation of a company-POV balance: negates so a
 * debt the partner owes us shows as «−…» (red) and money we owe them as «+…»
 * (green). Stored/served value is unchanged.
 */
export const formatPartnerBalance = (balance: number): string => formatSigned(-balance);

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
