import { withSaving } from "helpers/WithSaving";
import { makeAutoObservable, runInAction } from "mobx";
import { matchesSearch } from "utils/stringUtils";

import { Loadable, tryRun } from "../helpers/helpers";
import i18next from "../i18n/config";
import {
	CreateTransferRequest,
	CreateWalletRequest,
	UpdateWalletRequest,
	Wallet,
	WalletTransfer,
} from "../models/wallet";
import WalletApi from "../services/api/WalletApi";
import { NotificationStore } from "./NotificationStore";

export type WalletDialogMode =
	| { kind: "form"; wallet?: Wallet }
	| { kind: "archive"; wallet: Wallet }
	| { kind: "restore"; wallet: Wallet }
	| { kind: "transfer"; fromWalletId?: number }
	| { kind: "transferDetail"; transfer: WalletTransfer }
	| { kind: "none" };

/** Summary strip totals — span ALL wallets, archived ones with money included. */
export type WalletSummary = {
	totalBalance: number;
	totalOurMoney: number;
	totalAdvances: number;
};

export interface IWalletStore {
	allWallets: Loadable<Wallet[]>;
	filteredWallets: Loadable<Wallet[]>;
	summary: WalletSummary;
	archivedCount: number;

	searchTerm: string;
	showArchived: boolean;
	isSaving: boolean;
	dialogMode: WalletDialogMode;

	getAll(): Promise<void>;
	create(request: CreateWalletRequest): Promise<void>;
	update(request: UpdateWalletRequest): Promise<Wallet | null>;
	archive(wallet: Wallet): Promise<Wallet | null>;
	restore(wallet: Wallet): Promise<Wallet | null>;
	createTransfer(request: CreateTransferRequest): Promise<WalletTransfer | null>;

	setSearch(term: string): void;
	setShowArchived(show: boolean): void;

	openCreate(): void;
	openEdit(wallet: Wallet): void;
	openArchive(wallet: Wallet): void;
	openRestore(wallet: Wallet): void;
	openTransfer(fromWalletId?: number): void;
	openTransferDetail(transfer: WalletTransfer): void;
	closeDialog(): void;
}

export class WalletStore implements IWalletStore {
	private readonly notificationStore: NotificationStore;

	allWallets: Loadable<Wallet[]> = "loading";
	searchTerm = "";
	showArchived = false;
	isSaving = false;
	dialogMode: WalletDialogMode = { kind: "none" };

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	/** Total archived wallets — drives the «Архив» toggle badge (unfiltered). */
	get archivedCount(): number {
		if (this.allWallets === "loading") {
			return 0;
		}
		return this.allWallets.filter((w) => w.isArchived).length;
	}

	get filteredWallets(): Loadable<Wallet[]> {
		if (this.allWallets === "loading") {
			return "loading";
		}

		let wallets = this.allWallets;

		if (!this.showArchived) {
			wallets = wallets.filter((w) => !w.isArchived);
		}

		if (this.searchTerm.trim()) {
			wallets = wallets.filter((w) => matchesSearch(w.name, this.searchTerm));
		}

		return wallets;
	}

	/**
	 * Summary totals over EVERY wallet (archived included, rule 31) — served
	 * figures are summed, not recomputed from event lists (rule 12).
	 */
	get summary(): WalletSummary {
		if (this.allWallets === "loading") {
			return { totalBalance: 0, totalOurMoney: 0, totalAdvances: 0 };
		}
		return this.allWallets.reduce(
			(acc, w) => ({
				totalBalance: acc.totalBalance + w.balance,
				totalOurMoney: acc.totalOurMoney + w.ourMoney,
				totalAdvances: acc.totalAdvances + w.advancesHeld,
			}),
			{ totalBalance: 0, totalOurMoney: 0, totalAdvances: 0 },
		);
	}

	async getAll(): Promise<void> {
		runInAction(() => (this.allWallets = "loading"));

		const result = await tryRun(() => WalletApi.getAll());

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.getAll"));
		}

		runInAction(() => (this.allWallets = result.status === "success" ? result.data : []));
	}

	async create(request: CreateWalletRequest): Promise<void> {
		const result = await withSaving(this, () => WalletApi.create(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.create"));
			return;
		}

		runInAction(() => {
			if (this.allWallets !== "loading") {
				this.allWallets = [...this.allWallets, result.data];
			}
		});

		this.closeDialog();
		this.notificationStore.success(i18next.t("wallet.success.create", { name: result.data.name }));
	}

	async update(request: UpdateWalletRequest): Promise<Wallet | null> {
		const result = await withSaving(this, () => WalletApi.update(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.update"));
			return null;
		}

		this.replaceWallet(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("wallet.success.update"));
		return result.data;
	}

	async archive(wallet: Wallet): Promise<Wallet | null> {
		const result = await withSaving(this, () => WalletApi.archive(wallet.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.archive"));
			return null;
		}

		this.replaceWallet(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("wallet.success.archive", { name: wallet.name }));
		return result.data;
	}

	async restore(wallet: Wallet): Promise<Wallet | null> {
		const result = await withSaving(this, () => WalletApi.restore(wallet.id));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.restore"));
			return null;
		}

		this.replaceWallet(result.data);
		this.closeDialog();
		this.notificationStore.success(i18next.t("wallet.success.restore", { name: wallet.name }));
		return result.data;
	}

	async createTransfer(request: CreateTransferRequest): Promise<WalletTransfer | null> {
		const result = await withSaving(this, () => WalletApi.createTransfer(request));

		if (result.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.transfer"));
			return null;
		}

		// Both wallets' balances changed — refresh the served figures.
		await this.getAll();
		this.closeDialog();
		this.notificationStore.success(
			i18next.t("wallet.success.transfer", {
				from: result.data.fromWalletName,
				to: result.data.toWalletName,
			}),
		);
		return result.data;
	}

	setSearch(term: string): void {
		this.searchTerm = term;
	}

	setShowArchived(show: boolean): void {
		this.showArchived = show;
	}

	openCreate(): void {
		this.dialogMode = { kind: "form" };
	}

	openEdit(wallet: Wallet): void {
		this.dialogMode = { kind: "form", wallet };
	}

	openArchive(wallet: Wallet): void {
		this.dialogMode = { kind: "archive", wallet };
	}

	openRestore(wallet: Wallet): void {
		this.dialogMode = { kind: "restore", wallet };
	}

	openTransfer(fromWalletId?: number): void {
		this.dialogMode = { kind: "transfer", fromWalletId };
	}

	openTransferDetail(transfer: WalletTransfer): void {
		this.dialogMode = { kind: "transferDetail", transfer };
	}

	closeDialog(): void {
		this.dialogMode = { kind: "none" };
	}

	private replaceWallet(updated: Wallet): void {
		runInAction(() => {
			if (this.allWallets !== "loading") {
				this.allWallets = this.allWallets.map((w) => (w.id === updated.id ? updated : w));
			}
		});
	}
}

export default WalletStore;
