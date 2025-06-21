import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as MuiLink } from "@mui/material";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import { SortOrder } from "components/shared/DataTable/DataTable";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import SupplyFormModal, { SupplyFormPayload } from "components/supply/Form/SupplyFormModal";
import SupplyHeader from "components/supply/Header/SupplyHeader";
import SupplyItemsTable from "components/supply/Table/SupplyItemsTable";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Supply } from "models/supply";
import { TransactionRecord } from "models/transaction";
import { useStore } from "stores/StoreContext";
import { formatPrice } from "utils/supplyUtils";

const SupplyPage: React.FC = observer(() => {
	const { supplyStore, productStore, templateStore, partnersStore, transactionStore } = useStore();

	const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		transactionStore.getAll();
	}, [supplyStore, transactionStore]);

	const handleCreate = useCallback(() => {
		console.log(selectedSupply);
		setSelectedSupply(null);
		setIsFormOpen(true);
	}, []);

	// Columns for the main supplies table
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
					<ActionMenuCell
						onEdit={() => onEdit(row)}
						onArchive={() => {}}
						onDelete={() => onDelete(row)}
					/>
				),
			},
		],
		[],
	);

	const onEdit = (transaction: TransactionRecord): void => {
		console.log(transaction);
	};

	const onDelete = (transaction: TransactionRecord): void => {
		console.log(transaction);
	};

	const handleRowClick = useCallback((row: TransactionRecord) => {
		// TODO: implement sidepane opening (e.g. set state or call store)
		console.log("Row clicked:", row.id);
	}, []);

	const handleFormClose = (): void => {
		setSelectedSupply(null);
		setIsFormOpen(false);
	};

	const handleFormSave = (payload: SupplyFormPayload): Promise<void> => {
		console.log(payload);

		return Promise.resolve();
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
				onSearch={setSearchTerm}
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

			<SupplyFormModal
				isOpen={isFormOpen}
				onClose={handleFormClose}
				onSave={handleFormSave}
				productStore={productStore}
				partnersStore={partnersStore}
				supplyStore={supplyStore}
				templateStore={templateStore}
				onSaveTemplate={(val) => {
					console.log(val);
					return Promise.resolve();
				}}
			/>
		</>
	);
});

export default SupplyPage;
