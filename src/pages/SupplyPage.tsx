import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link as MuiLink } from "@mui/material";
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
import { useStore } from "stores/StoreContext";
import { formatPrice } from "utils/supplyUtils";

const SupplyPage: React.FC = observer(() => {
	const { supplyStore, productStore, templateStore, supplierStore } = useStore();

	const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		supplyStore.loadSupplies();
	}, [supplyStore]);

	const handleCreate = useCallback(() => {
		console.log(selectedSupply);
		setSelectedSupply(null);
		setIsFormOpen(true);
	}, []);

	// Columns for the main supplies table
	const supplyColumns: Column<Supply>[] = useMemo(
		() => [
			{
				key: "id",
				field: "id",
				headerName: translate("fieldId"),
				width: 80,
			},
			{
				key: "date",
				field: "date",
				headerName: translate("fieldDate"),
				width: 120,
				renderCell: (row) => new Date(row.date).toLocaleDateString("ru-RU"),
			},
			{
				key: "supplierName",
				field: "supplierName",
				headerName: translate("fieldSupplierName"),
				width: 200,
				renderCell: (row) => (
					<MuiLink
						href={`/suppliers/${row.supplierId}`}
						underline="none"
						sx={{
							color: "primary.main",
							"&:hover": { textDecoration: "underline" },
						}}
					>
						{row.supplierName}
					</MuiLink>
				),
			},
			{
				key: "totalDue",
				field: "totalDue",
				headerName: translate("fieldTotalDue"),
				align: "right",
				width: 120,
				renderCell: (row) => formatPrice(row.totalDue),
			},
			{
				key: "totalPaid",
				field: "totalPaid",
				headerName: translate("fieldTotalPaid"),
				align: "right",
				width: 120,
				renderCell: (row) => formatPrice(row.totalPaid),
			},
			{
				key: "notes",
				field: "notes",
				headerName: translate("fieldNotes"),
				width: 200,
				renderCell: (row) => row.notes ?? "—",
			},
		],
		[],
	);

	// Filtered rows based on searchTerm.
	// `supplyStore.supplies` is Loadable<Supply[]>.
	const filteredSupplies = useMemo(() => {
		const all = supplyStore.allSupplies;
		if (all === "loading") {
			return "loading";
		}
		// If there’s no search text, show all
		if (!searchTerm.trim()) {
			return all;
		}
		const lower = searchTerm.trim().toLowerCase();
		return all.filter(
			(s) =>
				String(s.id).includes(lower) ||
				s.supplierName.toLowerCase().includes(lower) ||
				(s.notes ?? "").toLowerCase().includes(lower),
		);
	}, [supplyStore.allSupplies, searchTerm]);

	// When a row is clicked, we could open a side pane:
	const handleRowClick = useCallback((row: Supply) => {
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

	return (
		<>
			<SupplyHeader searchValue={searchTerm} onSearch={setSearchTerm} onCreate={handleCreate} />

			<ExpandableDataTable<Supply>
				rows={filteredSupplies}
				columns={supplyColumns}
				pagination
				onRowClick={handleRowClick}
				renderExpanded={(supply) => <SupplyItemsTable items={supply.items} />}
			/>

			<SupplyFormModal
				isOpen={isFormOpen}
				onClose={handleFormClose}
				onSave={handleFormSave}
				productStore={productStore}
				supplierStore={supplierStore}
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
