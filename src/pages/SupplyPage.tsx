import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as MuiLink } from "@mui/material";
import TransactionsActionsMenu from "components/shared/ActionMenuCell/TransactionsMenuActionCell";
import { SortOrder } from "components/shared/DataTable/DataTable";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
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
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		transactionStore.getAll();
		partnerStore.getAll();
	}, [supplyStore, transactionStore]);

	const handlePartnerChange = (value: Partner): void => {
		setSelectedPartner(value);
		transactionStore.setFilterPartner(value?.id);
	};

	const handleCreate = useCallback(() => {
		console.log(selectedSupply);
		setSelectedSupply(null);
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
	};

	const handleRowClick = useCallback((row: TransactionRecord) => {
		transactionStore.setCurrentTransaction(row.id);
		setIsSidePaneOpen(true);
	}, []);

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

			<TransactionSidePane
				transaction={transactionStore.currentTransaction}
				payments={selectedTransactionStore.payments}
				isOpen={isSidePaneOpen}
				onClose={() => setIsSidePaneOpen(false)}
			/>
		</>
	);
});

export default SupplyPage;
