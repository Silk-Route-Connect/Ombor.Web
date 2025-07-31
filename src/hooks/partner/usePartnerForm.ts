import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Partner } from "models/partner";
import { PartnerFormInputs, PartnerFormValues, PartnerSchema } from "schemas/PartnerSchema";

export type PartnerFormPayload = PartnerFormValues;

export function usePartnerForm(isOpen: boolean, partner?: Partner | null) {
	const form = useForm<PartnerFormInputs>({
		resolver: zodResolver(PartnerSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: {
			type: "Customer",
			name: "",
			companyName: "",
			address: "",
			email: "",
			phoneNumbers: [],
			isActive: true,
			balance: 0,
		},
	});

	useEffect(() => {
		form.reset(
			partner
				? {
						type: partner.type,
						name: partner.name,
						companyName: partner.companyName ?? "",
						address: partner.address ?? "",
						email: partner.email ?? "",
						phoneNumbers: partner.phoneNumbers,
						isActive: true,
						balance: partner.balance,
					}
				: {
						type: "Customer",
						name: "",
						companyName: "",
						address: "",
						email: "",
						phoneNumbers: [],
						isActive: true,
						balance: 0,
					},
		);
	}, [partner, isOpen, form]);

	return form;
}
