import { OnboardingStepKey } from "components/onboarding/onboardingSteps";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { DashboardRecentTransaction } from "models/dashboard";
import ProductApi from "services/api/ProductApi";
import SettingsApi from "services/api/SettingsApi";
import TransactionApi from "services/api/TransactionApi";
import WarehouseApi from "services/api/WarehouseApi";

import AuthStore from "./AuthStore";

export type OnboardingProgress = Record<OnboardingStepKey, boolean>;

/** Matches the served cap of the dashboard's recent list (DashboardService, 10). */
const RECENT_LIMIT = 10;

export interface IOnboardingStore {
	/** Ticked steps; null until the first check has run. */
	progress: OnboardingProgress | null;
	/** The only active warehouse, when there is exactly one — the «остатки» step opens it. */
	singleWarehouseId: number | null;
	/** Show the checklist: checked, not complete, not dismissed. */
	readonly visible: boolean;
	readonly doneCount: number;

	refresh(recent: DashboardRecentTransaction[]): Promise<void>;
	dismiss(): void;
}

/**
 * Getting-started checklist state (ux-2 / scope-22). Every step is derived from
 * the organisation's real data — nothing is ticked by clicking. The dashboard's
 * recent list answers «sold / supplied anything?» for free; products, warehouses
 * and users are read only while the checklist is still open. Once complete (or
 * dismissed) the outcome is remembered per user in localStorage — a per-viewer
 * convenience — so later visits make no extra requests.
 */
export class OnboardingStore implements IOnboardingStore {
	private readonly authStore: AuthStore;

	progress: OnboardingProgress | null = null;
	singleWarehouseId: number | null = null;
	private closed = false;
	private checking = false;

	constructor(authStore: AuthStore) {
		this.authStore = authStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	get visible(): boolean {
		return !this.closed && this.progress !== null && this.doneCount < 4;
	}

	get doneCount(): number {
		return this.progress ? Object.values(this.progress).filter(Boolean).length : 0;
	}

	async refresh(recent: DashboardRecentTransaction[]): Promise<void> {
		if (this.checking) {
			return;
		}
		if (this.readClosed()) {
			runInAction(() => (this.closed = true));
			return;
		}
		this.checking = true;

		const recentSale = recent.some((t) => t.type === "Sale");
		const recentSupply = recent.some((t) => t.type === "Supply");
		// The recent list is capped: a full list of supplies only can hide an older sale.
		const sale = recentSale || (recent.length >= RECENT_LIMIT && (await this.anySale()));

		const [products, warehouses, users] = await Promise.all([
			sale ? Promise.resolve(null) : tryRun(() => ProductApi.getAll()),
			tryRun(() => WarehouseApi.getAll()),
			tryRun(() => SettingsApi.getUsers()),
		]);

		const productList = products?.status === "success" ? products.data : [];
		const active =
			warehouses.status === "success" ? warehouses.data.filter((w) => !w.isArchived) : [];

		const progress: OnboardingProgress = {
			products: sale || productList.length > 0,
			stock: sale || recentSupply || productList.some((p) => p.totalStock > 0),
			sale,
			team: users.status === "success" && users.data.length > 1,
		};

		runInAction(() => {
			this.progress = progress;
			this.singleWarehouseId = active.length === 1 ? active[0].id : null;
			this.checking = false;
		});

		if (Object.values(progress).every(Boolean)) {
			this.persistClosed();
		}
	}

	dismiss(): void {
		this.closed = true;
		this.persistClosed();
	}

	private async anySale(): Promise<boolean> {
		const result = await tryRun(() => TransactionApi.getAll({ type: "Sale" }));
		return result.status === "success" && result.data.length > 0;
	}

	private storageKey(): string {
		return `ombor.onboarding.closed.${this.authStore.getUser()?.id ?? "anon"}`;
	}

	private readClosed(): boolean {
		try {
			return localStorage.getItem(this.storageKey()) === "1";
		} catch {
			return false;
		}
	}

	private persistClosed(): void {
		try {
			localStorage.setItem(this.storageKey(), "1");
		} catch {
			/* storage unavailable — the checklist simply shows again next session */
		}
	}
}

export default OnboardingStore;
