import { FieldValues, Path, UseFormSetError } from "react-hook-form";
import i18next from "i18n/config";

import { parseApiError } from "./apiError";

/**
 * Puts a failed save's server field errors on the form. Returns true when every
 * field error found its field — the form then shows them inline and the store
 * skips its toast. Stores take it as an optional argument of create / update.
 */
export type ServerErrorHandler = (cause: unknown) => boolean;

/**
 * Server property (PascalCase, as ValidationProblemDetails `errors` keys it) →
 * form field + the localized message to show there. The server text is English
 * and never shown; a server-only rule (uniqueness) gets its own message.
 */
export type ServerFieldMap<T extends FieldValues> = Partial<
	Record<string, { field: Path<T>; messageKey: string }>
>;

export function applyServerFieldErrors<T extends FieldValues>(
	cause: unknown,
	setError: UseFormSetError<T>,
	map: ServerFieldMap<T>,
): boolean {
	const keys = Object.keys(parseApiError(cause).fieldErrors);
	if (keys.length === 0) {
		return false;
	}

	let allMapped = true;
	let first = true;
	for (const key of keys) {
		const target = map[key];
		if (!target) {
			allMapped = false;
			continue;
		}
		setError(
			target.field,
			{ type: "server", message: i18next.t(target.messageKey) },
			{ shouldFocus: first },
		);
		first = false;
	}
	return allMapped;
}
