import { isReady, Loadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";

export interface ReportLoadOptions {
	/**
	 * Keep the shown snapshot until the new one lands, and on a failed fetch — a
	 * refresh after an edit on the same page, so its figures never flash «—».
	 */
	refresh?: boolean;
}

/**
 * One report's served snapshot. Every filter change refetches it; only the
 * latest request lands (`LoadSequence`), so a slow «Этот месяц» answer never
 * overwrites the «Прошлый месяц» the user switched to.
 */
export class ReportResource<T> {
	private readonly loads = new LoadSequence();

	data: Loadable<T> = "loading";

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(fetch: () => Promise<T>, options?: ReportLoadOptions): Promise<void> {
		const isCurrent = this.loads.begin();
		const keep = options?.refresh === true && isReady(this.data);
		if (!keep) {
			this.data = "loading";
		}

		const result = await tryRun(fetch);
		if (!isCurrent() || (keep && result.status === "fail")) {
			return;
		}
		runInAction(() => (this.data = toLoadable(result)));
	}

	clear(): void {
		this.loads.invalidate();
		this.data = "loading";
	}
}

export default ReportResource;
