import React, { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import ConfirmDialog from "components/shared/ConfirmDialog";
import TemplateHeader from "components/template/Header/TemplateHeader";
import TemplateFormModal from "components/template/Modal/TemplateFormModal";
import TemplateTable from "components/template/Table/TemplatesTable";
import { TemplateFormPayload } from "hooks/templates/useTemplateForm";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";

const TemplatePage: React.FC = observer(() => {
	const { templateStore, partnerStore } = useStore();

	useEffect(() => {
		templateStore.getAll();
		partnerStore.getAll();
	}, [templateStore]);

	const handleFormSave = (payload: TemplateFormPayload) =>
		templateStore.selectedTemplate
			? templateStore.update({ id: templateStore.selectedTemplate.id, ...payload })
			: templateStore.create({ ...payload });

	const handleDeleteConfirmed = () => {
		if (templateStore.selectedTemplate) {
			templateStore.delete(templateStore.selectedTemplate.id);
		}
	};

	const templatesCount = useMemo(() => {
		if (templateStore.filteredTemplates === "loading") {
			return "";
		}

		return templateStore.filteredTemplates.length.toString();
	}, [templateStore.filteredTemplates]);

	const dialogMode = templateStore.dialogMode;
	const dialogKind = dialogMode.kind;

	return (
		<Box>
			<TemplateHeader
				searchValue={templateStore.searchTerm}
				selectedPartner={templateStore.selectedPartner}
				titleCount={templatesCount}
				onSearch={(value) => templateStore.setSearch(value)}
				onPartnerChange={(value) => templateStore.setSelectedPartner(value)}
				onCreate={templateStore.openCreate}
			/>

			<TemplateTable
				data={templateStore.filteredTemplates}
				onSort={templateStore.setSort}
				onEdit={templateStore.openEdit}
				onDelete={templateStore.openDelete}
			/>

			<TemplateFormModal
				isOpen={dialogKind === "form"}
				isSaving={templateStore.isSaving}
				template={templateStore.selectedTemplate}
				onClose={templateStore.closeDialog}
				onSave={handleFormSave}
			/>

			<ConfirmDialog
				isOpen={dialogKind === "delete"}
				title={translate("common.delete")}
				content={translate("template.deleteConfirmation", {
					templateName: templateStore.selectedTemplate?.name ?? "",
				})}
				onConfirm={handleDeleteConfirmed}
				onCancel={templateStore.closeDialog}
			/>
		</Box>
	);
});

export default TemplatePage;
