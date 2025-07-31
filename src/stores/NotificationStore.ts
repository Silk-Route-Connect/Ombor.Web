import { makeAutoObservable } from "mobx";
import type {
	EnqueueSnackbar,
	OptionsObject,
	ProviderContext,
	SnackbarKey,
	SnackbarMessage,
} from "notistack";

type PendingToast = Parameters<EnqueueSnackbar>;

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

	inject(realEnqueue: ProviderContext["enqueueSnackbar"]) {
		this.enqueue = realEnqueue;

		this.pending.forEach(([msg, opts]) => realEnqueue(msg, opts));
		this.pending = [];
	}
}
