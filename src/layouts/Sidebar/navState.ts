import { PATHS } from "routing/paths";

// Dense POS create-pages open with the rail collapsed for room (design autoCollapse).
export const POS_ROUTES = new Set<string>([PATHS.newSale, PATHS.newSupply, PATHS.newOrder]);

// Below a 1440px window the 248px column squeezes detail rails and wide tables
// (a 1366px laptop included), so the sidebar starts on the 72px rail (not
// persisted, like POS).
export const NARROW_VIEWPORT_QUERY = "(max-width: 1439.95px)";

/* Collapse state persists across sessions (design: `ombor.sidebar.expanded`). */
const SB_KEY = "ombor.sidebar.expanded";

export const readExpanded = (): boolean => {
	try {
		return localStorage.getItem(SB_KEY) !== "0";
	} catch {
		return true;
	}
};

export const writeExpanded = (value: boolean): void => {
	try {
		localStorage.setItem(SB_KEY, value ? "1" : "0");
	} catch {
		/* storage unavailable — in-memory state still holds for the session */
	}
};

export function isRouteActive(pathname: string, to: string): boolean {
	if (to === PATHS.dashboard) {
		return pathname === to;
	}
	return pathname === to || pathname.startsWith(`${to}/`);
}
