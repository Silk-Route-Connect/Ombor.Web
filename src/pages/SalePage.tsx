import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as MuiLink } from "@mui/material";
import TransactionsActionsMenu from "components/shared/ActionMenuCell/TransactionsMenuActionCell";
import {
	Column,
	ExpandableDataTable,
	SortOrder,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import TransactionSidePane from "components/shared/TransactionSidePane/TransactionSidePane";
import SupplyItemsTable from "components/supply/Table/SupplyItemsTable";
import TransactionHeader from "components/transaction/Header/TransactionHeader";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";
import { formatPrice } from "utils/supplyUtils";

const SalePage: React.FC = observer(() => {
	const { transactionStore, selectedTransactionStore, partnerStore } = useStore();

	const [selectedSale, setSelectedSale] = useState<TransactionRecord | null>(null);
	const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		transactionStore.getAll();
		partnerStore.getAll();
	}, [transactionStore, partnerStore]);

	const handlePartnerChange = (value: Partner | null): void => {
		setSelectedPartner(value);
		transactionStore.setFilterPartner(value?.id);
	};

	const handleCreate = useCallback(() => {
		console.log(selectedSale);
		setSelectedSale(null);
	}, []);

	const saleColumns: Column<TransactionRecord>[] = useMemo(
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
				headerName: translate("transaction.sale.partnerName"),
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
	};

	const handleRowClick = useCallback((row: TransactionRecord) => {
		transactionStore.setCurrentTransaction(row.id);
		setIsSidePaneOpen(true);
	}, []);

	const salesCount = useMemo(() => {
		if (transactionStore.sales === "loading") {
			return 0;
		}

		return transactionStore.sales.length;
	}, [transactionStore.sales]);

	return (
		<>
			<TransactionHeader
				mode="Sale"
				titleCount={salesCount}
				selectedPartner={selectedPartner}
				searchTerm={searchTerm}
				onSearch={setSearchTerm}
				onPartnerChange={handlePartnerChange}
				onCreate={handleCreate}
			/>

			<ExpandableDataTable<TransactionRecord>
				rows={transactionStore.sales}
				columns={saleColumns}
				pagination
				onSort={(field: keyof TransactionRecord, order: SortOrder) =>
					transactionStore.setSort(field, order)
				}
				onRowClick={handleRowClick}
				renderExpanded={(tx) => <SupplyItemsTable items={tx.lines} />}
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

export default SalePage;
