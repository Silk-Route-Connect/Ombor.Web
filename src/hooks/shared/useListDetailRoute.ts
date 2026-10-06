import { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useRouteEntityId } from "./useRouteEntityId";

export interface ListDetailRoute {
	/** The URL names a record (`/adjustments/4`, or an invalid `/adjustments/abc`). */
	isOpen: boolean;
	/** The record id, or null when the URL's `:id` is not a positive integer (→ not found). */
	id: number | null;
	/** Closes the detail: back to the previous page, or to the list on a direct load. */
	close: () => void;
}

/**
 * A read-only detail that opens as a modal over its list page under its own URL
 * (`/adjustments/:id`, `/transfers/:id`) so it can be bookmarked, shared and
 * linked from other pages. The list page renders for both routes.
 */
export function useListDetailRoute(listPath: string): ListDetailRoute {
	const { id: rawId } = useParams<{ id: string }>();
	const id = useRouteEntityId();
	const navigate = useNavigate();
	const location = useLocation();

	// A direct load has no in-app history (the router's default key): replace the
	// detail URL with the list so browser back does not reopen the modal.
	const close = useCallback(() => {
		if (location.key === "default") {
			void navigate(listPath, { replace: true });
		} else {
			void navigate(-1);
		}
	}, [location.key, navigate, listPath]);

	return { isOpen: rawId !== undefined, id, close };
}

export default useListDetailRoute;
