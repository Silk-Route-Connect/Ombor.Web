import { Loadable, toDetailLoadable, toLoadable } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { tryRun } from "helpers/TryRun";
import { makeAutoObservable, runInAction } from "mobx";
import { Partner, PartnerLedgerEntry } from "models/partner";
import PartnerApi from "services/api/PartnerApi";

import { NotificationStore } from "./NotificationStore";

export interface IPartnerLedgerStore {
	partner: Loadable<Partner | null>;
	ledger: Loadable<PartnerLedgerEntry[]>;

	load(partnerId: number): Promise<void>;
	/** Reflect a successful edit / archive / restore in place. */
	applyPartner(partner: Partner): void;
	clear(): void;
}

/**
 * State for the routed partner detail page: the open partner plus its
 * dispute-grade running-balance ledger, loaded explicitly by id when the route
 * mounts. The Транзакции and Платежи tabs are derived client-side from the
 * ledger (mocking.md — all list ops are client-side in v1).
 */
export class PartnerLedgerStore implements IPartnerLedgerStore {
	private readonly notificationStore: NotificationStore;

	partner: Loadable<Partner | null> = "loading";
	ledger: Loadable<PartnerLedgerEntry[]> = "loading";

	/** Guards against partner A's response landing on partner B's page. */
	private readonly loads = new LoadSequence();

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(partnerId: number): Promise<void> {
		const isCurrent = this.loads.begin();
		runInAction(() => {
			this.partner = "loading";
			this.ledger = "loading";
		});

		const [partner, ledger] = await Promise.all([
			tryRun(() => PartnerApi.getById(partnerId)),
			tryRun(() => PartnerApi.getLedger(partnerId)),
		]);

		if (!isCurrent()) {
			return;
		}

		if (partner.status === "fail") {
			this.notificationStore.notifyLoadError(partner, "partner.error.getById");
		} else if (ledger.status === "fail") {
			this.notificationStore.notifyLoadError(ledger, "partner.error.getLedger");
		}

		runInAction(() => {
			this.partner = toDetailLoadable(partner);
			this.ledger = toLoadable(ledger);
		});
	}

	applyPartner(partner: Partner): void {
		this.partner = partner;
	}

	clear(): void {
		this.loads.invalidate();
		this.partner = "loading";
		this.ledger = "loading";
	}
}

export default PartnerLedgerStore;
