import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Wallet, WalletOperation, WalletTransfer } from "models/wallet";
import WalletApi from "services/api/WalletApi";

import { NotificationStore } from "./NotificationStore";

export interface ISelectedWalletStore {
	wallet: Loadable<Wallet | null>;
	operations: Loadable<WalletOperation[]>;
	transfers: Loadable<WalletTransfer[]>;

	load(walletId: number): Promise<void>;
	/** Reflect a successful edit / archive / restore in place. */
	applyWallet(wallet: Wallet): void;
	/** Reload the wallet + its ledgers (after a transfer touches this wallet). */
	reload(walletId: number): Promise<void>;
	clear(): void;
}

/**
 * State for the routed wallet detail page: the open wallet plus its child
 * collections (the operations ledger and the inter-wallet transfers), loaded
 * explicitly by id when the route mounts.
 */
export class SelectedWalletStore implements ISelectedWalletStore {
	private readonly notificationStore: NotificationStore;

	wallet: Loadable<Wallet | null> = "loading";
	operations: Loadable<WalletOperation[]> = "loading";
	transfers: Loadable<WalletTransfer[]> = "loading";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(walletId: number): Promise<void> {
		runInAction(() => {
			this.wallet = "loading";
			this.operations = "loading";
			this.transfers = "loading";
		});

		const [wallet, operations, transfers] = await Promise.all([
			tryRun(() => WalletApi.getById(walletId)),
			tryRun(() => WalletApi.getOperations(walletId)),
			tryRun(() => WalletApi.getTransfers(walletId)),
		]);

		if (wallet.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.getById"));
		} else if (operations.status === "fail" || transfers.status === "fail") {
			this.notificationStore.error(i18next.t("wallet.error.getOperations"));
		}

		runInAction(() => {
			this.wallet = wallet.status === "success" ? wallet.data : null;
			this.operations = operations.status === "success" ? operations.data : [];
			this.transfers = transfers.status === "success" ? transfers.data : [];
		});
	}

	applyWallet(wallet: Wallet): void {
		this.wallet = wallet;
	}

	async reload(walletId: number): Promise<void> {
		const [wallet, operations, transfers] = await Promise.all([
			tryRun(() => WalletApi.getById(walletId)),
			tryRun(() => WalletApi.getOperations(walletId)),
			tryRun(() => WalletApi.getTransfers(walletId)),
		]);

		runInAction(() => {
			if (wallet.status === "success") {
				this.wallet = wallet.data;
			}
			if (operations.status === "success") {
				this.operations = operations.data;
			}
			if (transfers.status === "success") {
				this.transfers = transfers.data;
			}
		});
	}

	clear(): void {
		this.wallet = "loading";
		this.operations = "loading";
		this.transfers = "loading";
	}
}

export default SelectedWalletStore;
