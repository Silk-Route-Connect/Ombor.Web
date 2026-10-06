import { useEffect } from "react";

const REFRESH_EVERY_MS = 5 * 60_000;

/**
 * Keeps the bell current: reads on mount, every 5 minutes while the tab is
 * visible, and when the user comes back to the window (`refreshIfStale` skips
 * a read made within the last minute, so alt-tabbing costs nothing).
 */
export function useAlertRefresh(load: () => void, refreshIfStale: () => void): void {
	useEffect(() => {
		load();
		const timer = window.setInterval(() => {
			if (!document.hidden) {
				load();
			}
		}, REFRESH_EVERY_MS);
		const onVisible = () => {
			if (!document.hidden) {
				refreshIfStale();
			}
		};
		window.addEventListener("focus", refreshIfStale);
		document.addEventListener("visibilitychange", onVisible);
		return () => {
			window.clearInterval(timer);
			window.removeEventListener("focus", refreshIfStale);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, [load, refreshIfStale]);
}
