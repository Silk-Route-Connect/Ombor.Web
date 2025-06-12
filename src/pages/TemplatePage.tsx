// src/pages/TemplatePage.tsx
import React, { useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
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
import { translate } from "i18n/i18n";
import { Template } from "models/template";
import { useStore } from "stores/StoreContext";

const TemplatePage: React.FC = () => {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
	const { templateStore } = useStore();

	useEffect(() => {
		templateStore.load();
	}, [templateStore]);

	const columns: Column<Template>[] = [
		{
			key: "name",
			field: "name",
			headerName: translate("templateFieldName"),
			sortable: true,
		},
		{
			key: "type",
			field: "type",
			headerName: translate("templateType"),
			sortable: true,
			renderCell: (tpl) => translate(tpl.type === "Supply" ? "supply" : "sale"),
		},
		{
			key: "partnerName",
			field: "partnerName",
			headerName: translate("partner"),
			sortable: true,
		},
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
		const request = {
			name: payload.name,
			partnerId: payload.partnerId,
			type: payload.type,
			items: payload.items,
		};

		if (selectedTemplate) {
			templateStore.update({ id: selectedTemplate.id, ...request });
		} else {
			templateStore.create(request);
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

	const renderExpanded = (tpl: Template) => (
		<Table size="small">
			<TableHead>
				<TableRow>
					<TableCell>{translate("product")}</TableCell>
					<TableCell align="right">{translate("quantity")}</TableCell>
					<TableCell align="right">{translate("unitPrice")}</TableCell>
					<TableCell align="right">{translate("discount")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{tpl.items.map((item) => (
					<TableRow key={item.id}>
						<TableCell>{item.productName}</TableCell>
						<TableCell align="right">{item.quantity}</TableCell>
						<TableCell align="right">{item.unitPrice.toLocaleString()}</TableCell>
						<TableCell align="right">
							{item.discount != null ? item.discount.toLocaleString() : "-"}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<Box>
			<TemplateHeader
				searchValue={templateStore.searchTerm}
				onSearch={(val) => templateStore.search(val)}
				onCreate={onCreate}
			/>

			<ExpandableDataTable<Template>
				rows={templateStore.filteredTemplates}
				columns={columns}
				pagination
				onSort={(field, order: SortOrder) => templateStore.sort(field, order)}
				renderExpanded={renderExpanded}
			/>

			<TemplateFormModal
				isOpen={isFormOpen}
				template={selectedTemplate}
				onClose={() => setIsFormOpen(false)}
				onSave={onFormSave}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				title={translate("confirmDeletion")}
				content={<Typography>{translate("deleteTemplateConfirmation")}</Typography>}
				confirmLabel={translate("delete")}
				cancelLabel={translate("cancel")}
				onConfirm={onDeleteConfirmed}
				onCancel={() => setIsDeleteDialogOpen(false)}
			/>
		</Box>
	);
};

export default TemplatePage;
