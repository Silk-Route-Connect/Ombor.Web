import { ApiErrorKind, isNotFoundError, parseApiError } from "utils/apiError";

import { ActionResult } from "./TryRun";

/**
 * A load that failed. Pages render it as an error with «Повторить»
 * (`LoadStateView`) — a failed load is never shown as empty data or zeros.
 * A class (not a plain object) so MobX keeps it as-is and `instanceof` narrows it.
 */
export class LoadError {
	readonly kind: ApiErrorKind;

	constructor(cause?: unknown) {
		this.kind = parseApiError(cause).kind;
	}
}

/**
 * Tagged load state: `"loading"` → in flight, {@link LoadError} → failed,
 * anything else → ready data. By-id stores use `Loadable<T | null>`, where
 * `null` means the record does not exist (404 or an invalid id).
 */
export type Loadable<T> = T | "loading" | LoadError;

/**
 * How a caller asks for a load. `quiet`: the caller shows a failure itself — a
 * list page's inline `LoadStateView` — so the store raises no error toast (one
 * message per failure). Pickers fed by the same list load without it and toast.
 */
export interface LoadOptions {
	quiet?: boolean;
}

export function isLoading(...elements: Loadable<unknown>[]): boolean {
	return elements.some((el) => el === "loading");
}

export function isLoadError(value: unknown): value is LoadError {
	return value instanceof LoadError;
}

export function isReady<T>(value: Loadable<T>): value is T {
	return value !== "loading" && !(value instanceof LoadError);
}

/** Ready and present — narrows a by-id `Loadable<T | null>` to the record. */
export function isPresent<T>(value: Loadable<T | null>): value is T {
	return isReady(value) && value !== null;
}

/** The ready data, or `fallback` while loading / after a failure (pickers, counts). */
export function readyOr<T>(value: Loadable<T>, fallback: T): T {
	return isReady(value) ? value : fallback;
}

/** Derives from ready data; loading and failure pass through unchanged. */
export function mapLoadable<T, U>(value: Loadable<T>, map: (data: T) => U): Loadable<U> {
	return isReady(value) ? map(value) : value;
}

/** A list/collection load result as load state. */
export function toLoadable<T>(result: ActionResult<T>): Loadable<T> {
	return result.status === "success" ? result.data : new LoadError(result.cause);
}

/** A by-id load result as load state: a 404 is `null` (not found), any other failure an error. */
export function toDetailLoadable<T>(result: ActionResult<T>): Loadable<T | null> {
	if (result.status === "success") {
		return result.data;
	}
	return isNotFoundError(result.cause) ? null : new LoadError(result.cause);
}
