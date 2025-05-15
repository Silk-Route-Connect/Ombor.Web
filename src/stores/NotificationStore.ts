import { makeAutoObservable } from "mobx";
import type { OptionsObject, ProviderContext } from "notistack";

export class NotificationStore {
	private enqueue!: ProviderContext["enqueueSnackbar"];

	constructor() {
		makeAutoObservable(this);
	}

	inject(enqueueSnackbar: ProviderContext["enqueueSnackbar"]) {
		this.enqueue = enqueueSnackbar;
	}

	error(msg: string, opts?: OptionsObject) {
		this.enqueue(msg, { variant: "error", ...opts });
	}

	success(msg: string, opts?: OptionsObject) {
		this.enqueue(msg, { variant: "success", ...opts });
	}
}
