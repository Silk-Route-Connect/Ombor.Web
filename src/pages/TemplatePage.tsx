import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import TemplateHeader from "components/template/Header/TemplateHeader";
import TemplateFormModal from "components/template/Modal/TemplateFormModal";
import TemplatesTable from "components/template/Table/TemplatesTable";
import { TemplateFormPayload } from "hooks/templates/useTemplateForm";
import { observer } from "mobx-react-lite";
import { CreateTemplateRequest, UpdateTemplateRequest } from "models/template";
import { useStore } from "stores/StoreContext";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Box } from "@mui/material";

/**
 * Templates (Шаблоны) — reusable, partner-tied baskets of priced products that
 * load into a new Sale/Supply in one click (mvp-plan §12). Immutable-style list
 * with an expand-row detail, plus create/edit/delete (a template touches no
 * money or stock, so it is editable — not an immutable event).
 */
const TemplatePage: React.FC = observer(() => {
	const { t } = useTranslation();
	const { templateStore, partnerStore, productStore } = useStore();

	useEffect(() => {
		templateStore.resetFilters();
		templateStore.getAll();
		partnerStore.getAll();
		productStore.getAll();
	}, [templateStore, partnerStore, productStore]);

	const handleSave = (payload: TemplateFormPayload): void => {
		const selected = templateStore.selectedTemplate;
		if (selected) {
			const request: UpdateTemplateRequest = {
				id: selected.id,
				name: payload.name,
				partnerId: payload.partnerId,
				type: payload.type,
				items: payload.items.map((it) => ({
					id: it.id,
					productId: it.productId,
					quantity: it.quantity,
					unitPrice: it.unitPrice,
					discount: it.discount,
					discountType: it.discountType,
				})),
			};
			templateStore.update(request);
			return;
		}

		const request: CreateTemplateRequest = {
			name: payload.name,
			partnerId: payload.partnerId,
			type: payload.type,
			items: payload.items.map((it) => ({
				productId: it.productId,
				quantity: it.quantity,
				unitPrice: it.unitPrice,
				discount: it.discount,
				discountType: it.discountType,
			})),
		};
		templateStore.create(request);
	};

	const handleDeleteConfirmed = (): void => {
		if (templateStore.selectedTemplate) {
			templateStore.delete(templateStore.selectedTemplate.id);
		}
	};

	const all = templateStore.allTemplates === "loading" ? null : templateStore.allTemplates;
	const totalCount =
		templateStore.listTemplates === "loading" ? null : templateStore.listTemplates.length;
	const hasAny = (all?.length ?? 0) > 0;
	const isFiltering = templateStore.searchTerm.trim() !== "" || templateStore.typeFilter !== "all";
	const dialogMode = templateStore.dialogMode;

	return (
		<Box>
			<TemplateHeader
				totalCount={totalCount}
				searchValue={templateStore.searchTerm}
				typeFilter={templateStore.typeFilter}
				onSearch={templateStore.setSearch}
				onTypeChange={templateStore.setTypeFilter}
				onCreate={templateStore.openCreate}
			/>

			<TemplatesTable
				rows={templateStore.listTemplates}
				isFiltering={isFiltering}
				hasAny={hasAny}
				onEdit={templateStore.openEdit}
				onDelete={templateStore.openDelete}
				onCreate={templateStore.openCreate}
			/>

			<TemplateFormModal
				isOpen={dialogMode.kind === "form"}
				isSaving={templateStore.isSaving}
				template={dialogMode.kind === "form" ? (dialogMode.template ?? null) : null}
				onClose={templateStore.closeDialog}
				onSave={handleSave}
			/>

			<ConfirmDialog
				isOpen={dialogMode.kind === "delete"}
				icon={<DeleteOutlineIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("template.delete.title", {
					name: dialogMode.kind === "delete" ? dialogMode.template.name : "",
				})}
				content={t("template.delete.body")}
				confirmLabel={t("template.delete.confirm")}
				cancelLabel={t("common.cancel")}
				confirmVariant="danger"
				onConfirm={handleDeleteConfirmed}
				onCancel={templateStore.closeDialog}
			/>
		</Box>
	);
});

export default TemplatePage;
