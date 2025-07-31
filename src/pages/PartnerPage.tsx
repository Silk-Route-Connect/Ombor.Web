import React, { useEffect } from "react";
import { Box } from "@mui/material";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import PartnerHeader from "components/partner/Header/PartnerHeader";
import PartnerSidePane from "components/partner/SidePane/PartnerSidePane";
import { PartnerTable } from "components/partner/Table/PartnerTable";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { PartnerFormPayload } from "hooks/partner/usePartnerForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

const PartnerPage: React.FC = observer(() => {
	const { partnerStore } = useStore();

	useEffect(() => {
		partnerStore.getAll();
	}, [partnerStore]);

	const handleFormSave = (payload: PartnerFormPayload) =>
		partnerStore.selectedPartner
			? partnerStore.update({ id: partnerStore.selectedPartner.id, ...payload })
			: partnerStore.create({ ...payload });

	const handleDeleteConfirmed = (): void => {
		if (partnerStore.selectedPartner) {
			partnerStore.delete(partnerStore.selectedPartner.id);
		}
	};

	const { dialogMode } = partnerStore;
	const dialogType = dialogMode.type;

	return (
		<Box>
			<PartnerHeader
				searchValue={partnerStore.searchTerm}
				patnerType={partnerStore.type}
				onPartnerTypeChange={(value) => partnerStore.setTypeFilter(value)}
				onSearch={(value) => partnerStore.setSearch(value)}
				onCreate={() => partnerStore.openCreate()}
			/>

			<PartnerTable
				data={partnerStore.filteredPartners}
				pagination
				onSort={partnerStore.setSort}
				onEdit={partnerStore.openEdit}
				onDelete={partnerStore.openDelete}
				onArchive={() => {}}
				onViewDetails={partnerStore.openDetails}
			/>

			<PartnerFormModal
				isOpen={dialogType === "form"}
				isSaving={partnerStore.isSaving}
				partner={partnerStore.selectedPartner}
				onClose={partnerStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogType === "delete"}
				title={translate("common.delete")}
				content={translate("partner.deleteConfirmation", {
					partnerName: partnerStore.selectedPartner?.name ?? "",
				})}
				onCancel={partnerStore.closeDialog}
				onConfirm={handleDeleteConfirmed}
			/>

			<PartnerSidePane
				open={dialogType === "details"}
				partner={partnerStore.selectedPartner}
				onClose={partnerStore.closeDialog}
			/>
		</Box>
	);
});

export default PartnerPage;
