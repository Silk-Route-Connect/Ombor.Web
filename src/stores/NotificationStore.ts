import { makeAutoObservable } from "mobx";
import type {
	EnqueueSnackbar,
	OptionsObject,
	ProviderContext,
	SnackbarKey,
	SnackbarMessage,
} from "notistack";
import { describeApiError, parseApiError, ReasonOverrides } from "utils/apiError";

type PendingToast = Parameters<EnqueueSnackbar>;

/** A failed {@link ActionResult} — only the original error is read. */
type FailedCall = { cause?: unknown };

export class NotificationStore {
	private pending: PendingToast[] = [];
	private enqueue: EnqueueSnackbar = (
		message: SnackbarMessage,
		options?: OptionsObject,
	): SnackbarKey => {
		this.pending.push([message, options]);
		return "" as SnackbarKey;
	};

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	error(message: string, opts?: OptionsObject) {
		this.enqueue(message, { variant: "error", ...opts });
	}

	success(message: string, opts?: OptionsObject) {
		this.enqueue(message, { variant: "success", ...opts });
	}

	info(message: string, opts?: OptionsObject) {
		this.enqueue(message, { variant: "info", ...opts });
	}

	/**
	 * Error toast for a failed create / update / delete: the caller's action text
	 * plus the localized reason from the server's error code (never raw server text).
	 * `reasons` swaps the text of a code for this entity (code → i18n key).
	 */
	notifyApiError(
		failed: FailedCall,
		fallbackKey: string,
		params?: Record<string, unknown>,
		reasons?: ReasonOverrides,
	) {
		this.error(describeApiError(failed.cause, fallbackKey, params, reasons));
	}

	/**
	 * Error toast for a failed load that no surface shows as an error state — a
	 * picker fed by the failed list, «Показать ещё», a summary refresh. A load
	 * whose page renders its own `LoadStateView` raises no toast (its store skips
	 * this, or the page passes `{ quiet: true }`), so one failure is one message.
	 * No connection (incl. a gateway 502–504) is already shown by the header's
	 * connectivity status, a 404 is a not-found state, and a 401 means the session
	 * ended (the app is on its way to /login), so those stay silent here too.
	 */
	notifyLoadError(failed: FailedCall, fallbackKey: string, params?: Record<string, unknown>) {
		const { kind } = parseApiError(failed.cause);
		if (kind === "network" || kind === "notFound" || kind === "unauthorized") {
			return;
		}
		this.notifyApiError(failed, fallbackKey, params);
	}

	inject(realEnqueue: ProviderContext["enqueueSnackbar"]) {
		this.enqueue = realEnqueue;

		this.pending.forEach(([msg, opts]) => realEnqueue(msg, opts));
		this.pending = [];
	}
}
