import { Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
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
	private readonly loads = new LoadSequence();

	wallet: Loadable<Wallet | null> = "loading";
	operations: Loadable<WalletOperation[]> = "loading";
	transfers: Loadable<WalletTransfer[]> = "loading";

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(walletId: number): Promise<void> {
		const isCurrent = this.loads.begin();
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
		if (!isCurrent()) {
			return;
		}

		if (wallet.status === "fail") {
			this.notificationStore.notifyLoadError(wallet, "wallet.error.getById");
		} else if (operations.status === "fail") {
			this.notificationStore.notifyLoadError(operations, "wallet.error.getOperations");
		} else if (transfers.status === "fail") {
			this.notificationStore.notifyLoadError(transfers, "wallet.error.getOperations");
		}

		runInAction(() => {
			this.wallet = toDetailLoadable(wallet);
			this.operations = toLoadable(operations);
			this.transfers = toLoadable(transfers);
		});
	}

	applyWallet(wallet: Wallet): void {
		this.wallet = wallet;
	}

	async reload(walletId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		const [wallet, operations, transfers] = await Promise.all([
			tryRun(() => WalletApi.getById(walletId)),
			tryRun(() => WalletApi.getOperations(walletId)),
			tryRun(() => WalletApi.getTransfers(walletId)),
		]);
		if (!isCurrent()) {
			return;
		}

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
		this.loads.invalidate();
		this.wallet = "loading";
		this.operations = "loading";
		this.transfers = "loading";
	}
}

export default SelectedWalletStore;
