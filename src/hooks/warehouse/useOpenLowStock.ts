import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { reportPath } from "routing/paths";
import { useStore } from "stores/StoreContext";

/**
 * Opens the stock report («Остатки и стоимость склада») over every warehouse,
 * narrowed to exactly «Остаток: Заканчивается» — the rows the served counts
 * count (DR-41). The Warehouses «Заканчивается» card, the dashboard panel's
 * «Все» and the bell's low-stock alert land on the same list.
 */
export function useOpenLowStock(): () => void {
	const navigate = useNavigate();
	const { reportStore } = useStore();

	return useCallback(() => {
		reportStore.presetStock(null, "low");
		navigate(reportPath("stock"));
	}, [navigate, reportStore]);
}
