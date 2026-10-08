import type { TFunction } from "i18next";
import { formatWait } from "utils/apiError";
import { formatDateTime, formatTime } from "utils/dateUtils";

import { ProblemStatus } from "./presentation";

/** «в 14:31» today, the full date and time on an older day; null («—») if the server never answered. */
export function lastReachableText(t: TFunction, at: number | null, now: number): string | null {
	if (at == null) {
		return null;
	}
	const sameDay = new Date(at).toDateString() === new Date(now).toDateString();
	return sameDay
		? t("common.connectivity.lastReachableAt", { time: formatTime(new Date(at)) })
		: formatDateTime(new Date(at));
}

/** «через 12 сек.» to the armed re-check; offline there is none — the `online` event re-checks. */
export function nextCheckText(
	t: TFunction,
	status: ProblemStatus,
	checking: boolean,
	nextCheckAt: number | null,
	now: number,
): string | null {
	if (checking) {
		return t("common.connectivity.checking");
	}
	if (status === "offline") {
		return t("common.connectivity.whenOnline");
	}
	if (nextCheckAt == null) {
		return null;
	}
	const seconds = Math.max(1, Math.ceil((nextCheckAt - now) / 1_000));
	return t("common.connectivity.nextCheckIn", { wait: formatWait(seconds) });
}
