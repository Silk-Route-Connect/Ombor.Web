import React, { useEffect } from "react";
import { Box } from "@mui/material";
import TransactionForm from "components/transaction/Form/TransactionForm";
import {
	TransactionFormMode,
	useCreateTransactionForm,
} from "hooks/transactions/useCreateTransactionForm";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

interface CreateTransactionPageProps {
	mode: TransactionFormMode;
}

const CreateTransactionPage: React.FC<CreateTransactionPageProps> = observer(({ mode }) => {
	const { productStore, partnerStore, templateStore, transactionStore } = useStore();

	const form = useCreateTransactionForm(mode);

	useEffect(() => {
		productStore.getAll();
		partnerStore.getAll();
		templateStore.getAll();
	}, [productStore, partnerStore, templateStore]);

	const handleSave = async () => {
		if (!form.formIsValid) {
			return;
		}

		await transactionStore.create(form.buildPayload());
	};

	return (
		<Box sx={{ height: "88dvh", overflow: "hidden" }}>
			<TransactionForm mode={mode} form={form} onSave={handleSave} />
		</Box>
	);
});

export default CreateTransactionPage;
