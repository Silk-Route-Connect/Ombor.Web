import React, { useEffect } from "react";
import { Box } from "@mui/material";
import TransactionForm from "components/transaction/Form/TransactionForm";
import { useTransactionForm } from "hooks/transactions/useCreateTransactionForm";
import { TransactionFormMode } from "hooks/transactions/useTransactionForm";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

interface Props {
	mode: TransactionFormMode;
}

const TransactionCreatePage: React.FC<Props> = observer(({ mode }) => {
	const { productStore, partnerStore, templateStore, transactionStore } = useStore();
	const form = useTransactionForm({ mode });

	useEffect(() => {
		productStore.loadProducts();
		partnerStore.getAll();
		templateStore.getAll();
	}, [productStore, partnerStore, templateStore]);

	const handleSave = async () => {
		if (!form.isValid) {
			return;
		}

		const payload = form.buildPayload();
		transactionStore.create({ ...payload });
	};

	return (
		<Box sx={{ height: "88dvh", overflow: "hidden" }}>
			<TransactionForm mode={mode} form={form} onSave={handleSave} />
		</Box>
	);
});

export default TransactionCreatePage;
