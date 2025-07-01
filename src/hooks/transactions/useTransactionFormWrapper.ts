import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";

import { TransactionFormMode, useTransactionForm } from "./useTransactionForm";

export function useTransactionFormWrapper(
	mode: TransactionFormMode,
	initial?: TransactionRecord | null,
) {
	const { productStore, partnerStore, templateStore } = useStore();

	return useTransactionForm({ mode, initial, productStore, templateStore, partnerStore });
}
