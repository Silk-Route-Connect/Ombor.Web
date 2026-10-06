import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordRequest } from "models/settings";
import { ChangePasswordFormValues, ChangePasswordSchema } from "schemas/ChangePasswordSchema";
import { applyServerFieldErrors, ServerErrorHandler, ServerFieldMap } from "utils/formServerErrors";

const EMPTY: ChangePasswordFormValues = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

/** A wrong current password comes back as a field error on `CurrentPassword`. */
const SERVER_FIELDS: ServerFieldMap<ChangePasswordFormValues> = {
	CurrentPassword: {
		field: "currentPassword",
		messageKey: "settings.security.currentInvalid",
	},
};

export function useChangePasswordForm(
	onSave: (
		request: ChangePasswordRequest,
		applyServerErrors: ServerErrorHandler,
	) => Promise<boolean>,
) {
	const form = useForm<ChangePasswordFormValues>({
		resolver: zodResolver(ChangePasswordSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: EMPTY,
	});

	const applyServerErrors: ServerErrorHandler = (cause) =>
		applyServerFieldErrors(cause, form.setError, SERVER_FIELDS);

	const submit = form.handleSubmit(async (values) => {
		if (await onSave(values, applyServerErrors)) {
			form.reset(EMPTY);
		}
	});

	return { form, submit };
}
