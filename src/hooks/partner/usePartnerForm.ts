import { useCallback, useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Partner } from "models/partner";
import { PartnerFormInputs, PartnerFormValues, PartnerSchema } from "schemas/PartnerSchema";
import { emptyPartnerFormDefaults, mapPartnerToFormPayload } from "utils/partnerUtils";

export type PartnerFormPayload = PartnerFormValues;

interface UsePartnerFormParams {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	onSave: (partner: PartnerFormPayload) => void;
	onClose: () => void;
}

interface UsePartnerFormResult {
	form: UseFormReturn<PartnerFormInputs>;
	canSave: boolean;
	discardOpen: boolean;
	submit: () => Promise<void>;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

export function usePartnerForm({
	isOpen,
	isSaving,
	partner,
	onSave,
	onClose,
}: UsePartnerFormParams): UsePartnerFormResult {
	const form = useForm<PartnerFormInputs>({
		resolver: zodResolver(PartnerSchema),
		mode: "onBlur",
		reValidateMode: "onChange",
		criteriaMode: "all",
		defaultValues: emptyPartnerFormDefaults,
	});

	useEffect(() => {
		form.reset(partner ? mapPartnerToFormPayload(partner) : { ...emptyPartnerFormDefaults });
	}, [partner, isOpen, form]);

	const {
		handleSubmit,
		formState: { isDirty, isValid },
	} = form;

	const [discardOpen, setDiscardOpen] = useState(false);

	const cancelDiscard = () => setDiscardOpen(false);
	const confirmDiscard = () => {
		setDiscardOpen(false);
		onClose();
	};

	const submit = handleSubmit((data) =>
		onSave({
			...data,
			phoneNumbers: data.phoneNumbers ?? [],
		}),
	);

	const requestClose = useCallback(() => {
		if (isSaving) return;
		if (isDirty) {
			setDiscardOpen(true);
			return;
		}
		onClose();
	}, [isSaving, isDirty, onClose]);

	const canSave = isValid && !isSaving && (partner ? isDirty : true);

	return {
		form,
		canSave,
		discardOpen,
		submit,
		requestClose,
		confirmDiscard,
		cancelDiscard,
	};
}
