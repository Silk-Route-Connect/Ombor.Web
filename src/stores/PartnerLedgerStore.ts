import { Loadable } from "helpers/Loading";
import { tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
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

	constructor(notificationStore: NotificationStore) {
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	async load(partnerId: number): Promise<void> {
		runInAction(() => {
			this.partner = "loading";
			this.ledger = "loading";
		});

		const [partner, ledger] = await Promise.all([
			tryRun(() => PartnerApi.getById(partnerId)),
			tryRun(() => PartnerApi.getLedger(partnerId)),
		]);

		if (partner.status === "fail") {
			this.notificationStore.error(i18next.t("partner.error.getById"));
		} else if (ledger.status === "fail") {
			this.notificationStore.error(i18next.t("partner.error.getLedger"));
		}

		runInAction(() => {
			this.partner = partner.status === "success" ? partner.data : null;
			this.ledger = ledger.status === "success" ? ledger.data : [];
		});
	}

	applyPartner(partner: Partner): void {
		this.partner = partner;
	}

	clear(): void {
		this.partner = "loading";
		this.ledger = "loading";
	}
}

export default PartnerLedgerStore;
