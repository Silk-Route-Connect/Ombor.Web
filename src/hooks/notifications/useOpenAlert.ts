import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOpenLowStock } from "hooks/warehouse/useOpenLowStock";
import { NotificationKind } from "models/notification";
import { ordersDeliveryPath, PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

/**
 * Where a bell alert leads: the list already narrowed to exactly its records —
 * Долги «Неоплаченные документы» (only overdue, «Нам должны»), Orders by
 * «Доставка», the stock report over every warehouse by «Остаток: Заканчивается».
 */
export function useOpenAlert(): (kind: NotificationKind) => void {
	const navigate = useNavigate();
	const { debtStore } = useStore();
	const openLowStock = useOpenLowStock();

	return useCallback(
		(kind: NotificationKind) => {
			switch (kind) {
				case "OverdueReceivables":
					debtStore.applyCard("overdue");
					debtStore.setDirectionFilter("Receivable");
					debtStore.setSearch("");
					navigate(PATHS.debts);
					return;
				case "OrdersOverdue":
					navigate(ordersDeliveryPath("overdue"));
					return;
				case "OrdersDueToday":
					navigate(ordersDeliveryPath("today"));
					return;
				case "LowStock":
					openLowStock();
					return;
			}
		},
		[debtStore, navigate, openLowStock],
	);
}
