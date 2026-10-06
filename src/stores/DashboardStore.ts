import { LoadError } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { makeAutoObservable, runInAction } from "mobx";

import { tryRun } from "../helpers/helpers";
import { DashboardData, DashboardPeriod } from "../models/dashboard";
import DashboardApi from "../services/api/DashboardApi";
import { NotificationStore } from "./NotificationStore";

export interface IDashboardStore {
	/** The snapshot for the current period; null before the first load and after a failed one. */
	data: DashboardData | null;
	/** True while a fetch is in flight (initial load or a period re-fetch). */
	isLoading: boolean;
	/** Set when the last load failed — the page shows it with «Повторить», never stale numbers. */
	loadError: LoadError | null;
	period: DashboardPeriod;
	/** True when the served snapshot has no activity (new business). */
	isEmpty: boolean;

	load(): Promise<void>;
	setPeriod(period: DashboardPeriod): void;
}

/**
 * «Главное» dashboard — a read-only morning briefing. Holds the served snapshot
 * and the active period; switching period re-fetches. The previous snapshot stays
 * on screen (dimmed) while a re-fetch is in flight, so the header + period selector
 * stay mounted; a failed fetch drops it, so another period's numbers never sit
 * under the new period label. Its debt figures reconcile with «Долги» (rule 12).
 */
export class DashboardStore implements IDashboardStore {
	private readonly notificationStore: NotificationStore;
	private readonly loads = new LoadSequence();

	data: DashboardData | null = null;
	isLoading = false;
	loadError: LoadError | null = null;
	period: DashboardPeriod = "month";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.isLoading = true;
			this.loadError = null;
		});

		const result = await tryRun(() => DashboardApi.get(this.period));
		if (!isCurrent()) {
			return;
		}

		if (result.status === "fail") {
			this.notificationStore.notifyLoadError(result, "dashboard.error.load");
			runInAction(() => {
				this.data = null;
				this.loadError = new LoadError(result.cause);
				this.isLoading = false;
			});
			return;
		}

		runInAction(() => {
			this.data = result.data;
			this.isLoading = false;
		});
	}

	setPeriod(period: DashboardPeriod): void {
		if (period === this.period) {
			return;
		}
		this.period = period;
		void this.load();
	}

	/** A new business with no revenue, debts, or recent activity. */
	get isEmpty(): boolean {
		if (this.data === null) {
			return false;
		}
		const d = this.data;
		return (
			d.revenue.value === 0 &&
			d.receivable.value === 0 &&
			d.payable.value === 0 &&
			d.recentTransactions.length === 0
		);
	}
}

export default DashboardStore;
