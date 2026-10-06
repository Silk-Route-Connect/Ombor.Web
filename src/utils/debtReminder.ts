import { TFunction } from "i18next";
import { Debt } from "models/debt";
import { Partner } from "models/partner";
import { Organization } from "models/settings";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";

/** Where the owner sends the reminder from — always their own app, never an Ombor server SMS. */
export type ReminderChannel = "telegram" | "sms";

/** What a debt reminder states — all served figures. */
export interface DebtReminderFacts {
	partner: Partner;
	/** The served partner balance: what they owe us when positive. */
	amount: number;
	/** The oldest unpaid document they owe on; null when only the opening balance is owed. */
	oldestDate: string | null;
	organization: Organization;
}

/** Date of the partner's oldest unpaid receivable in the served debts list, or null. */
export function oldestReceivableDate(debts: Debt[], partnerId: number): string | null {
	const dates = debts
		.filter((d) => d.partnerId === partnerId && d.direction === "Receivable" && d.remaining > 0)
		.map((d) => d.date)
		.sort((a, b) => Date.parse(a) - Date.parse(b));
	return dates[0] ?? null;
}

/** The ready polite reminder, one sentence per line; the owner may edit it before sending. */
export function buildDebtReminderText(t: TFunction, facts: DebtReminderFacts): string {
	const { partner, organization } = facts;
	const lines = [
		t("partner.reminder.text.greeting", { name: partner.name }),
		t("partner.reminder.text.debt", {
			org: organization.name,
			amount: `${formatCurrency(facts.amount)} ${t("common.unit.uzs")}`,
		}),
	];
	if (facts.oldestDate) {
		lines.push(t("partner.reminder.text.since", { date: formatDate(facts.oldestDate) }));
	}
	lines.push(t("partner.reminder.text.request"));
	if (organization.phone?.trim()) {
		lines.push(t("partner.reminder.text.phone", { phone: organization.phone.trim() }));
	}
	lines.push(t("partner.reminder.text.signature", { org: organization.name }));
	return lines.join("\n");
}

/** The partner-form rule for a Telegram username (optional leading «@»). */
const TELEGRAM_HANDLE = /^@?([A-Za-z][A-Za-z0-9_]{4,31})$/;

/** The partner's Telegram username without «@», when it is a valid one. */
export const telegramUsername = (handle?: string | null): string | null =>
	handle?.trim().match(TELEGRAM_HANDLE)?.[1] ?? null;

/**
 * Telegram link with the text prefilled: straight into the partner's chat when
 * the username is known, otherwise Telegram's «share to…» chat picker.
 */
export function telegramReminderUrl(text: string, handle?: string | null): string {
	const encoded = encodeURIComponent(text);
	const username = telegramUsername(handle);
	return username
		? `https://t.me/${username}?text=${encoded}`
		: `https://t.me/share/url?url=${encoded}`;
}

/** sms: link to the partner's phone (empty recipient when none is known) with the text as its body. */
export function smsReminderUrl(text: string, phone?: string | null): string {
	const recipient = (phone ?? "").replace(/[^\d+]/g, "");
	return `sms:${recipient}?body=${encodeURIComponent(text)}`;
}
