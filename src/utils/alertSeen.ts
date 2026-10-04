import { NotificationAlert, NotificationKind } from "models/notification";

/**
 * What the user last marked as read: per alert kind, how many records it
 * concerned then. The server keeps no read state (alerts are computed), so
 * «new» is decided here.
 */
export type SeenCounts = Partial<Record<NotificationKind, number>>;

/** An alert is new when more records joined it than the user has already seen. */
export const isUnseen = (alert: NotificationAlert, seen: SeenCounts): boolean =>
	alert.count > (seen[alert.kind] ?? 0);

export const unseenCount = (alerts: NotificationAlert[], seen: SeenCounts): number =>
	alerts.filter((alert) => isUnseen(alert, seen)).length;

/** «Отметить как прочитанные»: remember every alert at its current size. */
export const markSeen = (alerts: NotificationAlert[]): SeenCounts =>
	Object.fromEntries(alerts.map((alert) => [alert.kind, alert.count]));

/**
 * Lowers the remembered counts to what is served now: once a cause is fixed
 * (the order delivered, the stock refilled) a new record of the same kind
 * shows as new again instead of hiding behind the old, larger count.
 */
export function reconcileSeen(alerts: NotificationAlert[], seen: SeenCounts): SeenCounts {
	const next: SeenCounts = {};
	for (const [kind, count] of Object.entries(seen) as [NotificationKind, number][]) {
		const current = alerts.find((alert) => alert.kind === kind)?.count ?? 0;
		const kept = Math.min(count, current);
		if (kept > 0) {
			next[kind] = kept;
		}
	}
	return next;
}

export const sameSeen = (a: SeenCounts, b: SeenCounts): boolean => {
	const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<NotificationKind>;
	return [...keys].every((kind) => a[kind] === b[kind]);
};
