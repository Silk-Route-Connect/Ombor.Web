import React from "react";
import PartnerLink from "components/partner/Links/PartnerLink";
import ActionMenu from "components/shared/ActionMenuCell/MenuActionCell";
import DateCell from "components/shared/Table/cells/DateCell";
import MoneyCell from "components/shared/Table/cells/MoneyCell";
import QuantityCell from "components/shared/Table/cells/QuantityCell";
import { Column } from "components/shared/Table/DataTable/DataTable";
import { ACTIONS_COLUMN_WIDTH } from "components/shared/Table/DataTable/tableConfigs";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { TFunction } from "i18next";
import { Template } from "models/template";
import { lineNet } from "utils/transactionUtils";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box } from "@mui/material";

export interface TemplateColumnHandlers {
	onEdit: (template: Template) => void;
	onDelete: (template: Template) => void;
}

/** A template's basket total: net line amounts after each line's discount (F4). */
export const templateTotal = (template: Template): number =>
	template.items.reduce((sum, item) => sum + lineNet(item), 0);

/**
 * Template list columns in the canonical order (conventions.md → Tables):
 * Шаблон · Тип · Партнёр · Позиций · Последнее использование · Сумма · ⋮.
 * Templates have no detail page; a row expands into its line items.
 */
export function buildTemplateColumns(
	t: TFunction,
	{ onEdit, onDelete }: TemplateColumnHandlers,
): Column<Template>[] {
	return [
		{
			key: "name",
			headerName: t("template.table.name"),
			sortValue: (tp) => tp.name,
			renderCell: (tp) => (
				<Box component="span" sx={{ fontWeight: 600 }}>
					{tp.name}
				</Box>
			),
		},
		{
			key: "type",
			headerName: t("template.table.type"),
			sortValue: (tp) => t(`template.type.${tp.type}`),
			renderCell: (tp) => <TransactionTypeBadge type={tp.type} />,
		},
		{
			key: "partner",
			headerName: t("template.table.partner"),
			sortValue: (tp) => tp.partnerName,
			renderCell: (tp) => <PartnerLink id={tp.partnerId} name={tp.partnerName} />,
		},
		{
			key: "positions",
			headerName: t("template.table.positions"),
			align: "right",
			sortValue: (tp) => tp.items.length,
			renderCell: (tp) => <QuantityCell value={tp.items.length} />,
		},
		{
			key: "lastUsed",
			headerName: t("template.table.lastUsed"),
			sortValue: (tp) => tp.lastUsedAt ?? null,
			renderCell: (tp) => <DateCell value={tp.lastUsedAt} kind="date" />,
		},
		{
			key: "total",
			headerName: t("template.table.total"),
			align: "right",
			sortValue: templateTotal,
			renderCell: (tp) => <MoneyCell value={templateTotal(tp)} main />,
		},
		{
			key: "actions",
			headerName: "",
			align: "right",
			width: ACTIONS_COLUMN_WIDTH,
			renderCell: (tp) => (
				<ActionMenu
					actions={[
						{
							key: "edit",
							label: t("common.edit"),
							icon: <EditOutlinedIcon fontSize="small" />,
							onClick: () => onEdit(tp),
						},
						{
							key: "delete",
							label: t("common.delete"),
							icon: <DeleteOutlineIcon fontSize="small" />,
							tone: "danger",
							dividerBefore: true,
							onClick: () => onDelete(tp),
						},
					]}
				/>
			),
		},
	];
}
