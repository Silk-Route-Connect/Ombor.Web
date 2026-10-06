import { CreatePartnerRequest, UpdatePartnerRequest } from "models/partner";
import { PartnerFormValues, signedOpeningBalance } from "schemas/PartnerSchema";

/** The partner form → the create request (the signed opening balance included). */
export const toCreatePartnerRequest = (values: PartnerFormValues): CreatePartnerRequest => ({
	type: values.type,
	name: values.name,
	companyName: values.companyName,
	address: values.address,
	email: values.email,
	telegram: values.telegram,
	phoneNumbers: values.phoneNumbers,
	openingBalance: signedOpeningBalance(values),
});

/** The partner form → the update request; the opening balance is a locked audit event. */
export const toUpdatePartnerRequest = (
	id: number,
	values: PartnerFormValues,
): UpdatePartnerRequest => ({
	id,
	type: values.type,
	name: values.name,
	companyName: values.companyName,
	address: values.address,
	email: values.email,
	telegram: values.telegram,
	phoneNumbers: values.phoneNumbers,
});
