import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { ActionCell } from "components/shared/ActionCell/ActionCell";
import ConfirmDialog from "components/shared/ConfirmDialog";
import { SortOrder } from "components/shared/DataTable/DataTable";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/ExpandableDataTable/ExpandableDataTable";
import TemplateHeader from "components/template/Header/TemplateHeader";
import TemplateFormModal, {
	TemplateFormPayload,
} from "components/template/Modal/TemplateFormModal";
import TemplateItemsTable from "components/template/Tables/TemplateItemsTable";
import { templateTableColumns } from "components/template/templateTableConfig";
import { translate } from "i18n/i18n";
import { observer } from "mobx-react-lite";
import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

const TemplatePage: React.FC = observer(() => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const { templateStore, partnerStore } = useStore();

	useEffect(() => {
		templateStore.getAll();
		partnerStore.getAll();
	}, [templateStore]);

	const columns: Column<Template>[] = [
		...templateTableColumns,
		{
			key: "actions",
			headerName: "",
			width: "10%",
			renderCell: (tpl: Template) => (
				<ActionCell onEdit={() => onEdit(tpl)} onDelete={() => onDelete(tpl)} />
			),
		},
	];

	const onCreate = () => {
		setSelectedTemplate(null);
		setIsFormOpen(true);
	};

	const onEdit = (tpl: Template) => {
		setSelectedTemplate(tpl);
		setIsFormOpen(true);
	};

	const onFormSave = (payload: TemplateFormPayload) => {
		if (selectedTemplate) {
			templateStore.update({ id: selectedTemplate.id, ...payload });
		} else {
			templateStore.create({ ...payload });
		}

		setIsFormOpen(false);
	};

	const onDelete = (tpl: Template) => {
		setSelectedTemplate(tpl);
		setIsDeleteDialogOpen(true);
	};

	const onDeleteConfirmed = () => {
		if (selectedTemplate) {
			templateStore.delete(selectedTemplate.id);
		}
		setIsDeleteDialogOpen(false);
	};

	const templatesCount = useMemo(() => {
		if (templateStore.filteredTemplates === "loading") {
			return "";
		}

		return templateStore.filteredTemplates.length.toString();
	}, [templateStore.filteredTemplates]);

	return (
		<Box>
			<TemplateHeader
				searchValue={templateStore.searchTerm}
				selectedPartner={templateStore.selectedPartner}
				titleCount={templatesCount}
				onSearch={(value) => templateStore.setSearch(value)}
				onPartnerChange={(value) => templateStore.setSelectedPartner(value)}
				onCreate={onCreate}
			/>

			<ExpandableDataTable<Template>
				rows={templateStore.filteredTemplates}
				columns={columns}
				pagination
				onSort={(field, order: SortOrder) => templateStore.setSort(field, order)}
				renderExpanded={(template) => <TemplateItemsTable items={template.items} />}
			/>

			<TemplateFormModal
				isOpen={isFormOpen}
				template={selectedTemplate}
				onClose={() => setIsFormOpen(false)}
				onSave={onFormSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("templates.confirm.deleteTitle")}
				content={<Typography>{translate("templates.confirm.deleteContent")}</Typography>}
				confirmLabel={translate("delete")}
				cancelLabel={translate("cancel")}
				onConfirm={onDeleteConfirmed}
				onCancel={() => setIsDeleteDialogOpen(false)}
			/>
		</Box>
	);
});

export default TemplatePage;
