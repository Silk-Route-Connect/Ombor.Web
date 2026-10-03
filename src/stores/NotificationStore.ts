import { makeAutoObservable } from "mobx";
import type {
	EnqueueSnackbar,
	OptionsObject,
	ProviderContext,
	SnackbarKey,
	SnackbarMessage,
} from "notistack";
import { describeApiError, parseApiError } from "utils/apiError";

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
	 */
	notifyApiError(failed: FailedCall, fallbackKey: string, params?: Record<string, unknown>) {
		this.error(describeApiError(failed.cause, fallbackKey, params));
	}

	/**
	 * Error toast for a failed load whose page renders the error state itself.
	 * No connection / a 5xx is already announced once by the connectivity toast,
	 * and a 404 is the page's not-found state, so those stay silent here.
	 */
	notifyLoadError(failed: FailedCall, fallbackKey: string, params?: Record<string, unknown>) {
		const { kind } = parseApiError(failed.cause);
		if (kind === "network" || kind === "server" || kind === "notFound") {
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
