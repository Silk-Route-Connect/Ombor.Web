import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as MuiLink } from "@mui/material";
import TransactionsActionsMenu from "components/shared/ActionMenuCell/TransactionsMenuActionCell";
import { SortOrder } from "components/shared/DataTable/DataTable";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import TransactionPaymentModal, {
	TransactionPaymentFormPayload,
} from "components/shared/Transaction/Form/Payment/TransactionPaymentModal";
import TransactionFormModal, {
	TransactionFormPayload,
	TransactionFormTemplatePayload,
} from "components/shared/Transaction/Form/TransactionFormModal";
import TransactionSidePane from "components/shared/TransactionSidePane/TransactionSidePane";
import SupplyHeader from "components/supply/Header/SupplyHeader";
import SupplyItemsTable from "components/supply/Table/SupplyItemsTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { Supply } from "models/supply";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";
import { formatPrice } from "utils/supplyUtils";

const SupplyPage: React.FC = observer(() => {
	const { supplyStore, transactionStore, selectedTransactionStore, partnerStore } = useStore();

	const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		transactionStore.getAll();
		partnerStore.getAll();
	}, [supplyStore, transactionStore]);

	useEffect(() => {
		if (!transactionStore.isSaving) {
			setIsFormOpen(false);
		}
	}, [transactionStore.isSaving]);

	const handlePartnerChange = (value: Partner): void => {
		setSelectedPartner(value);
		transactionStore.setFilterPartner(value?.id);
	};

	const handleCreate = useCallback(() => {
		console.log(selectedSupply);
		setSelectedSupply(null);
		setIsFormOpen(true);
	}, []);

	const supplyColumns: Column<TransactionRecord>[] = useMemo(
		() => [
			{
				key: "date",
				field: "date",
				headerName: translate("transaction.date"),
				width: "20%",
				sortable: true,
				renderCell: (row) => new Date(row.date).toLocaleString("ru-RU"),
			},
			{
				key: "partnerName",
				field: "partnerName",
				headerName: translate("transaction.supply.partnerName"),
				width: "20%",
				sortable: true,
				renderCell: (row) => (
					<MuiLink
						href={`/partners/${row.partnerId}`}
						underline="none"
						sx={{
							color: "primary.main",
							"&:hover": { textDecoration: "underline" },
						}}
					>
						{row.partnerName}
					</MuiLink>
				),
			},
			{
				key: "totalDue",
				field: "totalDue",
				headerName: translate("transaction.totalDue"),
				align: "right",
				width: "20%",
				sortable: true,
				renderCell: (row) => formatPrice(row.totalDue),
			},
			{
				key: "totalPaid",
				field: "totalPaid",
				headerName: translate("transaction.totalPaid"),
				align: "right",
				width: "20%",
				sortable: true,
				renderCell: (row) => formatPrice(row.totalPaid),
			},
			{
				key: "notes",
				field: "notes",
				headerName: translate("transaction.notes"),
				width: "15%",
				renderCell: (row) => row.notes?.substring(0, 20) ?? "—",
			},
			{
				key: "actions",
				headerName: "",
				width: 80,
				align: "right",
				renderCell: (row: TransactionRecord) => (
					<TransactionsActionsMenu
						fullyPaid={row.status === "Closed"}
						onPayment={() => handlePayment(row)}
						onRefund={() => handleRefund(row)}
					/>
				),
			},
		],
		[],
	);

	const handleRefund = (transaction: TransactionRecord): void => {
		console.log(transaction);
	};

	const handlePayment = (transaction: TransactionRecord): void => {
		transactionStore.setCurrentTransaction(transaction.id);
		setIsPaymentFormOpen(true);
	};

	const handleRowClick = useCallback((row: TransactionRecord) => {
		transactionStore.setCurrentTransaction(row.id);
		setIsSidePaneOpen(true);
	}, []);

	const handleFormClose = (): void => {
		setSelectedSupply(null);
		setIsFormOpen(false);
	};

	const handleFormSave = (payload: TransactionFormPayload): void => {
		transactionStore.create({
			...payload,
		});
	};

	const handlePaymentFormSave = (payload: TransactionPaymentFormPayload): void => {
		transactionStore.createPayment({
			...payload,
		});
	};

	const handlePaymentFormClose = (): void => {
		setIsPaymentFormOpen(false);
	};

	const handleTemplateSave = (payload: TransactionFormTemplatePayload): void => {
		// templateStore.create({ ...payload });
		console.log(payload);
	};

	const suppliesCount = useMemo(() => {
		if (transactionStore.supplies === "loading") {
			return "";
		}

		return transactionStore.supplies.length.toString();
	}, [transactionStore.supplies]);

	return (
		<>
			<SupplyHeader
				searchValue={searchTerm}
				titleCount={suppliesCount}
				selectedPartner={selectedPartner}
				onSearch={setSearchTerm}
				onPartnerChange={(value) => handlePartnerChange(value)}
				onCreate={handleCreate}
			/>

			<ExpandableDataTable<TransactionRecord>
				rows={transactionStore.supplies}
				columns={supplyColumns}
				pagination
				onSort={(field: keyof TransactionRecord, order: SortOrder) =>
					transactionStore.setSort(field, order)
				}
				onRowClick={handleRowClick}
				renderExpanded={(tx) => <SupplyItemsTable items={tx.lines} />}
			/>

			<TransactionFormModal
				isOpen={isFormOpen}
				isSaving={transactionStore.isSaving}
				mode="Supply"
				onClose={handleFormClose}
				onSave={handleFormSave}
				onSaveTemplate={handleTemplateSave}
			/>

			<TransactionSidePane
				transaction={transactionStore.currentTransaction}
				payments={selectedTransactionStore.payments}
				isOpen={isSidePaneOpen}
				onClose={() => setIsSidePaneOpen(false)}
			/>

			<TransactionPaymentModal
				transaction={
					transactionStore.currentTransaction === "loading"
						? null
						: transactionStore.currentTransaction
				}
				isOpen={isPaymentFormOpen}
				isSaving={transactionStore.isSaving}
				onSave={handlePaymentFormSave}
				onCancel={handlePaymentFormClose}
			/>
		</>
	);
});

export default SupplyPage;
