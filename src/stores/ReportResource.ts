import { Loadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";

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

	async load(fetch: () => Promise<T>): Promise<void> {
		const isCurrent = this.loads.begin();
		this.data = "loading";

		const result = await tryRun(fetch);
		if (!isCurrent()) {
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
