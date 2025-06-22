import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import { translate } from "i18n/i18n";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Partner } from "models/partner";
import { TransactionRecord } from "models/transaction";
import PartnerApi from "services/api/PartnerApi";
import { DateFilter, materialise, PresetOption } from "utils/dateFilterUtils";

import { NotificationStore } from "./NotificationStore";
import { IPartnerStore } from "./PartnerStore";

export interface ISelectedPartnerStore {
	/* data exposed to UI */
	allTransactions: Loadable<TransactionRecord[]>;
	filteredSales: Loadable<TransactionRecord[]>;
	filteredSupplies: Loadable<TransactionRecord[]>;

	/* current filter */
	readonly dateFilter: DateFilter;

	/* commands */
	setPreset(preset: PresetOption): void;
	setCustom(from: Date, to: Date): void;

	getSales(): Promise<void>;
	getSupplies(): Promise<void>;
}

export class SelectedPartnerStore implements ISelectedPartnerStore {
	/* ───────────────────── observable data ───────────────────── */
	private selectedPartner: Partner | null = null;

	private allSales: Loadable<TransactionRecord[]> = [];
	private allSupplies: Loadable<TransactionRecord[]> = [];

	/** Default filter = this week */
	dateFilter: DateFilter = { type: "preset", preset: "week" };

	/* ───────────────────── ctor ───────────────────── */
	constructor(
		private readonly partnerStore: IPartnerStore,
		private readonly notificationStore: NotificationStore,
	) {
		makeAutoObservable(this, {}, { autoBind: true });
		this.registerReactions();
	}

	/* ───────────── computed data AFTER filtering ───────────── */
	get allTransactions(): Loadable<TransactionRecord[]> {
		return this.allSales;
	}

	get filteredSales(): Loadable<TransactionRecord[]> {
		return this.applyFilter(this.allSales);
	}
	get filteredSupplies(): Loadable<TransactionRecord[]> {
		return this.applyFilter(this.allSupplies);
	}

	/* ───────────── public actions ───────────── */
	setPreset(preset: PresetOption) {
		this.dateFilter = { type: "preset", preset };
	}
	setCustom(from: Date, to: Date) {
		this.dateFilter = { type: "custom", from, to };
	}

	async getSales(): Promise<void> {
		if (this.allSales === "loading" || !this.selectedPartner) return;
		runInAction(() => (this.allSales = "loading"));

		const res = await tryRun(() => PartnerApi.getSales(this.selectedPartner!.id));
		if (res.status === "fail") {
			this.notificationStore.error(translate("partner.error.getSales"));
			return;
		}
		runInAction(() => (this.allSales = res.data));
	}

	async getSupplies(): Promise<void> {
		if (this.allSupplies === "loading" || !this.selectedPartner) return;
		runInAction(() => (this.allSupplies = "loading"));

		const res = await tryRun(() => PartnerApi.getSupplies(this.selectedPartner!.id));
		if (res.status === "fail") {
			this.notificationStore.error(translate("partner.error.getSupplies"));
			return;
		}
		runInAction(() => (this.allSupplies = res.data)); // ← fixed earlier bug
	}

	/* ───────────── helpers ───────────── */
	private applyFilter(data: Loadable<TransactionRecord[]>): Loadable<TransactionRecord[]> {
		if (data === "loading") return "loading";

		const { from, to } = materialise(this.dateFilter);
		return data.filter((t) => {
			const d = new Date(t.date);
			if (from && d < from) return false;
			if (to && d > to) return false;
			return true;
		});
	}

	private registerReactions() {
		reaction(
			() => this.partnerStore.selectedPartner,
			(partner) => {
				runInAction(() => {
					this.selectedPartner = partner;
					this.allSales = [];
					this.allSupplies = [];
					this.dateFilter = { type: "preset", preset: "week" };
				});
				if (partner) {
					this.getSales();
					this.getSupplies();
				}
			},
			{ fireImmediately: true },
		);
	}
}
