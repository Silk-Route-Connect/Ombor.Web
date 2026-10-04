import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

/**
 * Opens Products narrowed to exactly «Остаток: Заканчивается» (every other
 * filter off) — the dashboard «Заканчивается» panel's «Все» and the bell's
 * low-stock alert land on the same list.
 */
export function useOpenLowStock(): () => void {
	const navigate = useNavigate();
	const { productStore } = useStore();

	return useCallback(() => {
		productStore.setSearch("");
		productStore.setCategoryFilter(null);
		productStore.setTypeFilter("all");
		productStore.setShowArchived(false);
		productStore.setStockFilter("low");
		navigate(PATHS.products);
	}, [navigate, productStore]);
}
