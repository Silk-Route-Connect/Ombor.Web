import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PartnerFormModal from "components/partner/Form/PartnerFormModal";
import PartnerListHeader from "components/partner/List/PartnerListHeader";
import PartnersTable from "components/partner/List/PartnersTable";
import PartnerSummaryStrip from "components/partner/List/PartnerSummaryStrip";
import { buildPartnerColumns } from "components/partner/List/partnerTableConfigs";
import PartnerDialogs from "components/partner/PartnerDialogs";
import { useTableOrder } from "components/shared/Table/tableOrder";
import { isReady, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { Partner } from "models/partner";
import { partnerDetailPath } from "routing/paths";
import { PartnerFormValues } from "schemas/PartnerSchema";
import { useStore } from "stores/StoreContext";
import { csvDateStamp, exportToCsv } from "utils/exportToCsv";
import { toCreatePartnerRequest, toUpdatePartnerRequest } from "utils/partnerRequest";
import { formatUzPhone } from "utils/phoneUtils";

import { Box } from "@mui/material";

const PartnerPage: React.FC = observer(() => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { partnerStore, debtStore } = useStore();
	const tableOrder = useTableOrder<Partner>();

	useEffect(() => {
		void partnerStore.getAll({ quiet: true });
	}, [partnerStore]);

	// The strip's totals are served; a partner create / edit / delete (a new list) can move them.
	const partners = partnerStore.allPartners;
	useEffect(() => {
		if (isReady(partners)) {
			void debtStore.getSummary();
		}
	}, [partners, debtStore]);

	const handleDelete = (partner: Partner) => {
		if (partner.isDeletable) {
			partnerStore.openDelete(partner);
		} else {
			partnerStore.openCannotDelete(partner);
		}
	};

	const columns = useMemo(
		() =>
			buildPartnerColumns(t, {
				onEdit: (p) => partnerStore.openEdit(p),
				onArchive: (p) => partnerStore.openArchive(p),
				onRestore: (p) => partnerStore.openRestore(p),
				onDelete: handleDelete,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[t],
	);

	const handleSave = (values: PartnerFormValues) => {
		const editing =
			partnerStore.dialogMode.kind === "form" ? partnerStore.dialogMode.partner : null;
		if (editing) {
			void partnerStore.update(toUpdatePartnerRequest(editing.id, values));
		} else {
			void partnerStore.create(toCreatePartnerRequest(values));
		}
	};

	const handleExport = () => {
		const rows = partnerStore.filteredPartners;
		if (!isReady(rows)) {
			return;
		}
		exportToCsv<Partner>(
			`partners_${csvDateStamp()}`,
			[
				{ header: t("partner.table.name"), value: (p) => p.name },
				{ header: t("partner.table.type"), value: (p) => t(`partner.typeShort.${p.type}`) },
				{ header: t("partner.table.company"), value: (p) => p.companyName ?? "" },
				{
					header: t("partner.table.phone"),
					value: (p) => p.phoneNumbers.map(formatUzPhone).filter(Boolean).join(", "),
				},
				// Partner-side sign exactly as the table shows it (DR-27): a debtor exports negative.
				{ header: t("partner.table.balance"), value: (p) => -p.balance || 0 },
				{
					header: t("partner.table.status"),
					value: (p) =>
						p.isArchived ? t("partner.table.statusArchived") : t("partner.table.statusActive"),
				},
			],
			tableOrder.apply(rows),
		);
	};

	const isFiltering = partnerStore.searchTerm.trim() !== "" || partnerStore.typeFilter !== "All";
	const dialogMode = partnerStore.dialogMode;
	const editingPartner = dialogMode.kind === "form" ? (dialogMode.partner ?? null) : null;

	return (
		<Box>
			<PartnerListHeader
				summary={
					partnerStore.activeCount > 0 && (
						<PartnerSummaryStrip
							summary={debtStore.summary}
							activeCount={partnerStore.activeCount}
						/>
					)
				}
				searchValue={partnerStore.searchTerm}
				typeFilter={partnerStore.typeFilter}
				showArchived={partnerStore.showArchived}
				archivedCount={partnerStore.archivedCount}
				onSearch={(v) => partnerStore.setSearch(v)}
				onTypeChange={(v) => partnerStore.setTypeFilter(v)}
				onToggleArchived={(v) => partnerStore.setShowArchived(v)}
				onCreate={() => partnerStore.openCreate()}
				onExport={handleExport}
				exportCount={readyOr(partnerStore.filteredPartners, []).length}
			/>

			<PartnersTable
				exportOrder={tableOrder}
				onRetry={() => void partnerStore.getAll({ quiet: true })}
				errorTitle={t("partner.error.getAll")}
				rows={partnerStore.filteredPartners}
				columns={columns}
				isFiltering={isFiltering}
				hasActive={partnerStore.activeCount > 0}
				showArchived={partnerStore.showArchived}
				onOpen={(p) => navigate(partnerDetailPath(p.id))}
				onCreate={() => partnerStore.openCreate()}
			/>

			<PartnerFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={partnerStore.isSaving}
				partner={editingPartner}
				onSave={handleSave}
				onClose={() => partnerStore.closeDialog()}
			/>

			<PartnerDialogs />
		</Box>
	);
});

export default PartnerPage;
