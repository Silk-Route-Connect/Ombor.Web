import { useCallback, useEffect, useMemo, useState } from "react";
import TransactionSidePane from "components/shared/TransactionSidePane/TransactionSidePane";
import TransactionHeader from "components/transaction/Header/TransactionHeader";
import { TransactionsTable } from "components/transaction/Table/TransactionsTable";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";

interface TransactionPageProps {
	mode: "Sale" | "Supply";
}

const TransactionPage: React.FC<TransactionPageProps> = observer(({ mode }) => {
	const { transactionStore, selectedTransactionStore, partnerStore } = useStore();

	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		transactionStore.getAll();
		partnerStore.getAll();
	}, [mode]);

	const handlePartnerChange = (value: Partner | null): void => {
		setSelectedPartner(value);
		transactionStore.setFilterPartner(value?.id);
	};

	const handleCreate = useCallback(() => {
		console.log("handle create");
	}, []);

	const handleRowClick = useCallback((row: TransactionRecord) => {
		transactionStore.setSelectedTransaction(row.id);
		setIsSidePaneOpen(true);
	}, []);

	const transactions = useMemo(
		() => (mode === "Sale" ? transactionStore.sales : transactionStore.supplies),
		[mode],
	);
	const transactionsCount = transactions === "loading" ? 0 : transactions.length;

	return (
		<>
			<TransactionHeader
				mode={mode}
				titleCount={transactionsCount}
				selectedPartner={selectedPartner}
				searchTerm={searchTerm}
				onSearch={setSearchTerm}
				onPartnerChange={handlePartnerChange}
				onCreate={handleCreate}
			/>

			<TransactionsTable
				rows={mode === "Sale" ? transactionStore.sales : transactionStore.supplies}
				pagination
				onRowClick={handleRowClick}
				onPayment={(id) => console.log(id)}
				onRefund={(id) => console.log(id)}
			/>

			<TransactionSidePane
				transaction={transactionStore.currentTransaction}
				payments={selectedTransactionStore.payments}
				isOpen={isSidePaneOpen}
				onClose={() => setIsSidePaneOpen(false)}
			/>
		</>
	);
});

export default TransactionPage;
