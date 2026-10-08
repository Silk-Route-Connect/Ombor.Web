import { isPresent, Loadable, LoadError } from "helpers/Loading";
import { LoadSequence } from "helpers/LoadSequence";
import { ActionResult, tryRun } from "helpers/TryRun";
import i18next from "i18n/config";
import { makeAutoObservable, runInAction } from "mobx";
import { Debt } from "models/debt";
import { Partner } from "models/partner";
import { Organization } from "models/settings";
import DebtApi from "services/api/DebtApi";
import PartnerApi from "services/api/PartnerApi";
import { isNotFoundError } from "utils/apiError";
import {
	DebtReminderFacts,
	oldestReceivableDate,
	ReminderChannel,
	smsReminderUrl,
	telegramReminderUrl,
} from "utils/debtReminder";

import { NotificationStore } from "./NotificationStore";
import { ISettingsStore } from "./SettingsStore";

export interface IDebtReminderStore {
	isOpen: boolean;
	/** The partner, their served balance, the oldest unpaid date and our business profile. */
	facts: Loadable<DebtReminderFacts | null>;

	open(partnerId: number): void;
	reload(): Promise<void>;
	close(): void;
	copy(text: string): Promise<void>;
	send(channel: ReminderChannel, text: string): Promise<void>;
}

const writeClipboard = async (text: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
};

/**
 * «Напомнить о долге» (scope-23, text-share version): gathers what the
 * reminder states and hands the text to the owner's own Telegram or SMS app.
 * Ombor sends nothing itself — no server SMS, nothing to rate-limit or log.
 */
export class DebtReminderStore implements IDebtReminderStore {
	private readonly settingsStore: ISettingsStore;
	private readonly notificationStore: NotificationStore;
	private readonly loads = new LoadSequence();
	private partnerId: number | null = null;

	isOpen = false;
	facts: Loadable<DebtReminderFacts | null> = "loading";

	constructor(settingsStore: ISettingsStore, notificationStore: NotificationStore) {
		this.settingsStore = settingsStore;
		this.notificationStore = notificationStore;
		makeAutoObservable(this, {}, { autoBind: true });
	}

	open(partnerId: number): void {
		this.partnerId = partnerId;
		this.isOpen = true;
		void this.reload();
	}

	async reload(): Promise<void> {
		const partnerId = this.partnerId;
		if (partnerId === null) {
			return;
		}
		const isCurrent = this.loads.begin();
		runInAction(() => (this.facts = "loading"));

		const [partner, debts, organization] = await Promise.all([
			tryRun(() => PartnerApi.getById(partnerId)),
			tryRun(() => DebtApi.getAll()),
			this.settingsStore.ensureOrganization(),
		]);
		if (!isCurrent()) {
			return;
		}

		runInAction(() => (this.facts = toFacts(partner, debts, organization)));
	}

	close(): void {
		this.loads.invalidate();
		this.isOpen = false;
		this.partnerId = null;
		this.facts = "loading";
	}

	async copy(text: string): Promise<void> {
		if (await writeClipboard(text)) {
			this.notificationStore.success(i18next.t("partner.reminder.copied"));
		} else {
			this.notificationStore.error(i18next.t("partner.reminder.copyFailed"));
		}
	}

	/**
	 * Opens the owner's Telegram / SMS app with the text. The text is also put on
	 * the clipboard, so it can be pasted where an app ignores the prefill.
	 */
	async send(channel: ReminderChannel, text: string): Promise<void> {
		if (!isPresent(this.facts)) {
			return;
		}
		const { partner } = this.facts;
		// Started before the app opens: the clipboard accepts a write only while this tab has focus.
		const copying = writeClipboard(text);
		if (channel === "telegram") {
			window.open(telegramReminderUrl(text, partner.telegram), "_blank", "noopener,noreferrer");
		} else {
			window.location.href = smsReminderUrl(text, partner.phoneNumbers[0]);
		}
		if (await copying) {
			this.notificationStore.info(i18next.t("partner.reminder.pasteHint"));
		}
	}
}

function toFacts(
	partner: ActionResult<Partner>,
	debts: ActionResult<Debt[]>,
	organization: Loadable<Organization | null>,
): Loadable<DebtReminderFacts | null> {
	if (partner.status === "fail") {
		return isNotFoundError(partner.cause) ? null : new LoadError(partner.cause);
	}
	if (debts.status === "fail") {
		return new LoadError(debts.cause);
	}
	if (!isPresent(organization)) {
		return organization;
	}
	return {
		partner: partner.data,
		amount: partner.data.balance,
		oldestDate: oldestReceivableDate(debts.data, partner.data.id),
		organization,
	};
}

export default DebtReminderStore;
