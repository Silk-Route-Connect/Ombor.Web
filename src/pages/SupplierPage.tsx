import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import SupplierFormModal, { SupplierFormPayload } from "components/supplier/Form/SupplierFormModal";
import SupplierHeader from "components/supplier/Header/SupplierHeader";
import SupplierSidePane from "components/supplier/SidePane/SupplierSidePane";
import { supplierColumns } from "components/supplier/supplierTableConfig";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Supplier } from "models/supplier";
import { useStore } from "stores/StoreContext";

const SupplierPage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

	const { supplierStore } = useStore();

	// 1. Load suppliers on mount and whenever searchTerm changes
	useEffect(() => {
		supplierStore.loadSuppliers();
	}, [supplierStore, supplierStore.searchTerm]);

	const rows = useMemo<Loadable<Supplier[]>>(
		() => supplierStore.filteredSuppliers,
		[supplierStore.filteredSuppliers],
	);

	const handleCreate = useCallback(() => {
		setSelectedSupplier(null);
		setIsFormOpen(true);
	}, []);

	const handleEdit = useCallback((s: Supplier) => {
		setSelectedSupplier(s);
		setIsFormOpen(true);
	}, []);

	const handleDelete = useCallback((s: Supplier) => {
		setSelectedSupplier(s);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirmDelete = () => {
		if (selectedSupplier) {
			supplierStore.deleteSupplier(selectedSupplier.id);
		}
		setIsDeleteDialogOpen(false);
		setSelectedSupplier(null);
	};

	const handleSave = (payload: SupplierFormPayload) => {
		if (selectedSupplier) {
			supplierStore.updateSupplier({ ...payload, id: selectedSupplier.id, balance: 100 });
		} else {
			supplierStore.createSupplier({ ...payload, balance: 100 });
		}
		setIsFormOpen(false);
		setSelectedSupplier(null);
	};

	const handleRowClick = useCallback((s: Supplier) => {
		setSelectedSupplier(s);
		setIsSidePaneOpen(true);
	}, []);

	const handleSidePaneClose = () => {
		setSelectedSupplier(null);
		setIsSidePaneOpen(false);
	};

	const columns = useMemo<Column<Supplier>[]>(
		() => [
			...supplierColumns,
			{
				key: "actions",
				headerName: "",
				width: 80,
				align: "right",
				renderCell: (s: Supplier) => (
					<ActionMenuCell
						onEdit={() => handleEdit(s)}
						onArchive={() => {
							/* no archive logic yet */
						}}
						onDelete={() => handleDelete(s)}
					/>
				),
			},
		],
		[handleEdit, handleDelete],
	);

	const getConfirmationContent = (): JSX.Element => {
		if (!selectedSupplier) {
			return <Typography>{translate("confirmDeleteSupplier")}</Typography>;
		}
		return (
			<Typography>
				{translate("confirmDeleteSupplier")} <strong>{selectedSupplier.name}</strong>?
			</Typography>
		);
	};

	return (
		<>
			<SupplierHeader
				searchValue={supplierStore.searchTerm}
				onSearch={(v) => supplierStore.setSearch(v)}
				onCreate={handleCreate}
			/>

			<DataTable<Supplier>
				rows={rows}
				columns={columns}
				pagination
				onRowClick={(s) => handleRowClick(s)}
			/>

			<SupplierFormModal
				key={selectedSupplier?.id ?? "new"}
				isOpen={isFormOpen}
				supplier={selectedSupplier}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedSupplier(null);
				}}
				onSave={handleSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("deleteSupplierTitle")}
				content={getConfirmationContent()}
				confirmLabel={translate("delete")}
				cancelLabel={translate("cancel")}
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
			/>

			<SupplierSidePane
				open={isSidePaneOpen}
				supplier={selectedSupplier}
				onClose={handleSidePaneClose}
			/>
		</>
	);
});

export default SupplierPage;
