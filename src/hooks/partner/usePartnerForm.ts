import { useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { Partner } from "models/partner";
import { PartnerFormInputs, PartnerFormValues, PartnerSchema } from "schemas/PartnerSchema";
import { emptyPartnerFormDefaults, mapPartnerToFormPayload } from "utils/partnerUtils";

interface UsePartnerFormParams {
	isOpen: boolean;
	isSaving: boolean;
	partner?: Partner | null;
	onSave: (values: PartnerFormValues) => void;
	onClose: () => void;
}

interface UsePartnerFormResult {
	form: UseFormReturn<PartnerFormInputs>;
	submit: () => void;
	discardOpen: boolean;
	requestClose: () => void;
	confirmDiscard: () => void;
	cancelDiscard: () => void;
}

/**
 * Create/edit form state for a partner. Mirrors the shared form-hook pattern:
 * zod-validated, reset on open, dirty-close confirmation. The submit button is
 * always enabled — validation runs on submit and reports inline (rules 5/7).
 */
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
		if (!isOpen) {
			return;
		}
		form.reset(partner ? mapPartnerToFormPayload(partner) : { ...emptyPartnerFormDefaults });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [partner, isOpen]);

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		form.formState.isDirty,
		isSaving,
		onClose,
	);

	const submit = form.handleSubmit((data) => onSave(data as PartnerFormValues));

	return { form, submit, discardOpen, requestClose, confirmDiscard, cancelDiscard };
}
