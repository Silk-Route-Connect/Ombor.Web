import { makeAutoObservable, runInAction } from "mobx";

import { Loadable, tryRun } from "../helpers/helpers";
import { translate } from "../i18n/i18n";
import { DashboardPeriod, DashboardSummary } from "../models/dashboard";
import dashboardApi from "../services/api/DashboardApi";
import { NotificationStore } from "./NotificationStore";

export interface IDashboardStore {
	summary: Loadable<DashboardSummary>;
	period: DashboardPeriod;

	getSummary(): Promise<void>;
	setPeriod(period: DashboardPeriod): void;
}

export class DashboardStore implements IDashboardStore {
	private readonly notificationStore: NotificationStore;

	summary: Loadable<DashboardSummary> = "loading";
	period: DashboardPeriod = "month";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;

		makeAutoObservable(this, {}, { autoBind: true });
	}

	async getSummary(): Promise<void> {
		runInAction(() => (this.summary = "loading"));

		const result = await tryRun(() => dashboardApi.getSummary(this.period));

		if (result.status === "fail") {
			this.notificationStore.error(translate("dashboard.error.load"));
			return;
		}

		runInAction(() => (this.summary = result.data));
	}

	setPeriod(period: DashboardPeriod): void {
		if (this.period === period) {
			return;
		}

		this.period = period;
		void this.getSummary();
	}
}

export default DashboardStore;
