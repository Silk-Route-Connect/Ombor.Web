import { Partner } from "models/partner";
import { PartnerFormInputs } from "schemas/PartnerSchema";

export const PARTNER_TYPES = ["Customer", "Supplier", "Both"] as const;

export const getBalanceColor = (balance: number): string => {
	if (balance < 0) {
		return "error.main";
	} else if (balance > 0) {
		return "success.main";
	}

	return "text.primary";
};

export const emptyPartnerFormDefaults: PartnerFormInputs = {
	type: "Customer",
	name: "",
	companyName: "",
	address: "",
	email: "",
	phoneNumbers: [""],
	isActive: true,
	balance: 0,
};

export const mapPartnerToFormPayload = (partner: Partner): PartnerFormInputs => {
	return {
		type: partner.type,
		name: partner.name,
		companyName: partner.companyName ?? "",
		address: partner.address ?? "",
		email: partner.email ?? "",
		phoneNumbers: mapPhoneNumbers(partner.phoneNumbers),
		isActive: true,
		balance: partner.balance,
	};
};

// when partner doesn't have phone numbers,
// empty array should be '[""]' instead of []
// to render initial empty phone number input field
const mapPhoneNumbers = (phoneNumbers: string[]) => (phoneNumbers.length > 1 ? phoneNumbers : [""]);
