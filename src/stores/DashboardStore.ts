import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { DashboardData, DashboardPeriod } from "../models/dashboard";
import DashboardApi from "../services/api/DashboardApi";
import { NotificationStore } from "./NotificationStore";

export interface IDashboardStore {
	data: Loadable<DashboardData | null>;
	period: DashboardPeriod;
	/** True when the served snapshot has no activity (new business). */
	isEmpty: boolean;

	load(): Promise<void>;
	setPeriod(period: DashboardPeriod): void;
}

/**
 * «Главное» dashboard — a read-only morning briefing. Holds the served snapshot
 * and the active period; switching period re-fetches. The snapshot is mocked at
 * the target v1 contract (no backend endpoint); its debt figures reconcile with
 * the «Долги» page (rule 12).
 */
export class DashboardStore implements IDashboardStore {
	private readonly notificationStore: NotificationStore;

	data: Loadable<DashboardData | null> = "loading";
	period: DashboardPeriod = "month";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(): Promise<void> {
		runInAction(() => (this.data = "loading"));

		const result = await tryRun(() => DashboardApi.get(this.period));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("dashboard.error.load"));
			runInAction(() => (this.data = null));
			return;
		}

		runInAction(() => (this.data = result.data));
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
		if (this.data === "loading" || this.data === null) {
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
