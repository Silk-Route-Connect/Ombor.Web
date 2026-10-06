import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import i18next from "i18n/config";
import { InviteUserRequest, TenantUser } from "models/settings";
import {
	InviteUserFormInputs,
	InviteUserFormValues,
	InviteUserSchema,
} from "schemas/InviteUserSchema";
import { parseApiError } from "utils/apiError";
import { applyServerFieldErrors, ServerErrorHandler, ServerFieldMap } from "utils/formServerErrors";
import { uzPhoneToStored } from "utils/phoneUtils";

const EMPTY: InviteUserFormInputs = { firstName: "", lastName: "", phone: "" };

const SERVER_FIELDS: ServerFieldMap<InviteUserFormInputs> = {
	Value: { field: "phone", messageKey: "settings.invite.errorPhone" },
	FirstName: { field: "firstName", messageKey: "auth.errors.tooLong" },
	LastName: { field: "lastName", messageKey: "auth.errors.tooLong" },
};

export interface UseInviteUserFormOptions {
	isOpen: boolean;
	onInvite: (
		request: InviteUserRequest,
		applyServerErrors: ServerErrorHandler,
	) => Promise<TenantUser | null>;
}

/**
 * The invite modal's form. `invited` is the created user once the server accepted
 * it — the modal then switches to how that colleague signs in.
 */
export function useInviteUserForm({ isOpen, onInvite }: UseInviteUserFormOptions) {
	const form = useForm<InviteUserFormInputs, unknown, InviteUserFormValues>({
		resolver: zodResolver(InviteUserSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: EMPTY,
	});
	const [invited, setInvited] = useState<TenantUser | null>(null);
	const { reset } = form;

	useEffect(() => {
		if (isOpen) {
			reset(EMPTY);
			setInvited(null);
		}
	}, [isOpen, reset]);

	// A number that already has an account (in any business) is the one server-only
	// rule; it lands on the phone field with its own words.
	const applyServerErrors: ServerErrorHandler = (cause) => {
		if (parseApiError(cause).code === "auth.phone_taken") {
			form.setError(
				"phone",
				{ type: "server", message: i18next.t("settings.invite.phoneTaken") },
				{ shouldFocus: true },
			);
			return true;
		}
		return applyServerFieldErrors(cause, form.setError, SERVER_FIELDS);
	};

	const submit = form.handleSubmit(async (values) => {
		const user = await onInvite(
			{
				method: "Phone",
				value: uzPhoneToStored(values.phone),
				firstName: values.firstName,
				lastName: values.lastName || null,
			},
			applyServerErrors,
		);
		if (user) {
			setInvited(user);
		}
	});

	return { form, submit, invited };
}
