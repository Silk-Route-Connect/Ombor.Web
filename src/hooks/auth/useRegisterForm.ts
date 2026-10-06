import React from "react";
import { RegisterRequest } from "models/auth";
import { analytics } from "services/telemetry";
import { describeApiReason } from "utils/apiError";
import { RegisterField, registerServerErrors } from "utils/authErrors";
import { confirmError, passwordError, phoneError, requiredError } from "utils/authValidation";
import { normalizeUzPhoneToE164 } from "utils/phoneUtils";

export interface RegisterValues {
	company: string;
	firstName: string;
	lastName: string;
	/** The 9 national digits. */
	phone: string;
	password: string;
	confirm: string;
	terms: boolean;
}

const EMPTY: RegisterValues = {
	company: "",
	firstName: "",
	lastName: "",
	phone: "",
	password: "",
	confirm: "",
	terms: false,
};

/** Same rules as `RegisterRequestValidator`: i18n key per failing field. */
function clientErrors(v: RegisterValues): Partial<Record<RegisterField, string>> {
	const all: Record<RegisterField, string | null> = {
		company: requiredError(v.company),
		firstName: requiredError(v.firstName),
		lastName: requiredError(v.lastName),
		phone: phoneError(v.phone),
		password: passwordError(v.password),
		confirm: confirmError(v.password, v.confirm),
	};
	return Object.fromEntries(Object.entries(all).filter(([, key]) => key !== null));
}

const ANALYTICS_FIELD: Record<RegisterField, string> = {
	company: "company",
	firstName: "first_name",
	lastName: "last_name",
	phone: "phone",
	password: "password",
	confirm: "confirm",
};

/**
 * The registration form: values, inline errors (client rules first, then what the
 * server refused, e.g. an already-registered phone), and the banner for anything
 * that is not about a field on this form.
 */
export function useRegisterForm() {
	const [values, setValues] = React.useState<RegisterValues>(EMPTY);
	const [tried, setTried] = React.useState(false);
	const [serverErrors, setServerErrors] = React.useState<Partial<Record<RegisterField, string>>>(
		{},
	);
	const [banner, setBanner] = React.useState<string | null>(null);

	const set = <K extends keyof RegisterValues>(key: K, value: RegisterValues[K]): void => {
		setValues((v) => ({ ...v, [key]: value }));
		setServerErrors((e) => {
			if (!(key in e)) {
				return e;
			}
			const next = { ...e };
			delete next[key as RegisterField];
			return next;
		});
	};

	const errors = { ...serverErrors, ...(tried ? clientErrors(values) : {}) };
	const termsError = tried && !values.terms;

	/** Validates on submit; the request to send, or null when a field needs fixing. */
	const prepare = (): RegisterRequest | null => {
		setTried(true);
		setBanner(null);
		const failed = Object.keys(clientErrors(values)).map(
			(f) => ANALYTICS_FIELD[f as RegisterField],
		);
		if (!values.terms) {
			failed.push("terms");
		}
		if (failed.length > 0) {
			analytics.capture("form_validation_failed", {
				form: "register",
				field_count: failed.length,
				first_field: failed[0],
			});
			return null;
		}
		return {
			firstName: values.firstName.trim(),
			lastName: values.lastName.trim(),
			phoneNumber: normalizeUzPhoneToE164(values.phone),
			password: values.password,
			confirmPassword: values.confirm,
			organizationName: values.company.trim(),
		};
	};

	/** The server refused: errors land on their fields; anything else goes to the banner. */
	const fail = (cause: unknown): void => {
		const { fields, unplaced } = registerServerErrors(cause);
		setServerErrors(fields);
		setBanner(unplaced ? describeApiReason(cause, "auth.register.failed") : null);
	};

	return { values, set, errors, termsError, banner, prepare, fail };
}

export type RegisterForm = ReturnType<typeof useRegisterForm>;
