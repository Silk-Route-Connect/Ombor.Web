import { useParams } from "react-router-dom";

/**
 * The detail route's `:id` as a positive integer, or `null` when it is not one
 * (`/payments/abc`). A null id renders the page's not-found state instead of
 * loading forever.
 */
export function useRouteEntityId(): number | null {
	const { id } = useParams<{ id: string }>();
	const value = Number(id);
	return Number.isInteger(value) && value > 0 ? value : null;
}
