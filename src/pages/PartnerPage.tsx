import React, { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import ActionMenuCell from "components/shared/ActionMenuCell/ActionMenuCell";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { Column, DataTable } from "components/shared/DataTable/DataTable";
import PartnerFormModal, { PartnerFormPayload } from "components/supplier/Form/PartnerFormModal";
import PartnerHeader from "components/supplier/Header/PartnerHeader";
import { partnerColumns } from "components/supplier/partnerTableConfigs";
import PartnerSidePane from "components/supplier/SidePane/PartnerSidePane";
import { Loadable } from "helpers/Loading";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Partner, PartnerType } from "models/partner";
import { useStore } from "stores/StoreContext";

const PartnerPage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
	const [selectedSupplier, setSelectedSupplier] = useState<Partner | null>(null);
	const [selectedType, setSelectedType] = useState<PartnerType>("All");

	const { partnerStore } = useStore();

	useEffect(() => {
		partnerStore.getAll();
	}, [partnerStore, partnerStore.searchTerm]);

	const rows = useMemo<Loadable<Partner[]>>(
		() => partnerStore.filteredPartners,
		[partnerStore.filteredPartners],
	);

	const handleCreate = useCallback(() => {
		setSelectedSupplier(null);
		setIsFormOpen(true);
	}, []);

	const handleEdit = useCallback((s: Partner) => {
		setSelectedSupplier(s);
		setIsFormOpen(true);
	}, []);

	const handleDelete = useCallback((s: Partner) => {
		setSelectedSupplier(s);
		setIsDeleteDialogOpen(true);
	}, []);

	const handleConfirmDelete = () => {
		if (selectedSupplier) {
			partnerStore.deleteSupplier(selectedSupplier.id);
		}
		setIsDeleteDialogOpen(false);
		setSelectedSupplier(null);
	};

	const handleSave = (payload: PartnerFormPayload) => {
		if (selectedSupplier) {
			partnerStore.updateSupplier({ ...payload, id: selectedSupplier.id, balance: 100 });
		} else {
			partnerStore.createSupplier({ ...payload, balance: 100 });
		}
		setIsFormOpen(false);
		setSelectedSupplier(null);
	};

	const handleRowClick = useCallback((s: Partner) => {
		partnerStore.setSelectedPartner(s.id);
		setSelectedSupplier(s);
		setIsSidePaneOpen(true);
	}, []);

	const handleSidePaneClose = () => {
		setSelectedSupplier(null);
		setIsSidePaneOpen(false);
	};

	const columns = useMemo<Column<Partner>[]>(
		() => [
			...partnerColumns,
			{
				key: "actions",
				headerName: "",
				width: 80,
				align: "right",
				renderCell: (partner: Partner) => (
					<ActionMenuCell
						onEdit={() => handleEdit(partner)}
						onArchive={() => {}}
						onDelete={() => handleDelete(partner)}
					/>
				),
			},
		],
		[handleEdit, handleDelete],
	);

	const getConfirmationContent = (): JSX.Element => {
		if (!selectedSupplier) {
			return <Typography>{translate("partner.confirmDeleteTitle")}</Typography>;
		}
		return (
			<Typography>
				{translate("partner.confirmDeleteTitle")} <strong>{selectedSupplier.name}</strong>?
			</Typography>
		);
	};

	return (
		<>
			<PartnerHeader
				searchValue={partnerStore.searchTerm}
				filterType={selectedType}
				onTypeChange={(type) => setSelectedType(type)}
				onSearch={(v) => partnerStore.setSearch(v)}
				onCreate={handleCreate}
			/>

			<DataTable<Partner>
				rows={rows}
				columns={columns}
				pagination
				onRowClick={(s) => handleRowClick(s)}
			/>

			<PartnerFormModal
				key={selectedSupplier?.id ?? "new"}
				isOpen={isFormOpen}
				partner={selectedSupplier}
				onClose={() => {
					setIsFormOpen(false);
					setSelectedSupplier(null);
				}}
				onSave={handleSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("partner.deleteTitle")}
				content={getConfirmationContent()}
				confirmLabel={translate("delete")}
				cancelLabel={translate("cancel")}
				onCancel={() => setIsDeleteDialogOpen(false)}
				onConfirm={handleConfirmDelete}
			/>

			<PartnerSidePane
				open={isSidePaneOpen}
				partner={selectedSupplier}
				onClose={handleSidePaneClose}
			/>
		</>
	);
});

export default PartnerPage;
