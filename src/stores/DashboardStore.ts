import { makeAutoObservable, runInAction } from "mobx";

import { tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import { DashboardData, DashboardPeriod } from "../models/dashboard";
import DashboardApi from "../services/api/DashboardApi";
import { NotificationStore } from "./NotificationStore";

export interface IDashboardStore {
	/** The last successfully-loaded snapshot; null before the first load. */
	data: DashboardData | null;
	/** True while a fetch is in flight (initial load or a period re-fetch). */
	isLoading: boolean;
	period: DashboardPeriod;
	/** True when the served snapshot has no activity (new business). */
	isEmpty: boolean;

	load(): Promise<void>;
	setPeriod(period: DashboardPeriod): void;
}

/**
 * «Главное» dashboard — a read-only morning briefing. Holds the served snapshot
 * and the active period; switching period re-fetches. The previous snapshot is
 * kept during a re-fetch (so the header + period selector stay mounted and only
 * the content shows a spinner). The snapshot is mocked at the target v1 contract
 * (no backend endpoint); its debt figures reconcile with the «Долги» page (rule 12).
 */
export class DashboardStore implements IDashboardStore {
	private readonly notificationStore: NotificationStore;

	data: DashboardData | null = null;
	isLoading = false;
	period: DashboardPeriod = "month";

	/** Monotonic load counter — guards against a slow response overwriting a newer one. */
	private loadSeq = 0;

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(): Promise<void> {
		const seq = ++this.loadSeq;
		runInAction(() => (this.isLoading = true));

		const result = await tryRun(() => DashboardApi.get(this.period));

		// A newer load started while this was in flight — discard this response so a
		// slow earlier-period fetch can't clobber the current period's KPIs.
		if (seq !== this.loadSeq) {
			return;
		}

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("dashboard.error.load"));
			// Keep the previous snapshot (if any) so a transient re-fetch failure
			// doesn't blank the page; the toast reports the error.
			runInAction(() => (this.isLoading = false));
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
