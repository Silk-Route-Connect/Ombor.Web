import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import PartnerLink from "components/partner/Links/PartnerLink";
import ProductLink from "components/product/Links/ProductLink";
import ActionMenu from "components/shared/ActionMenuCell/MenuActionCell";
import { CopyableCell } from "components/shared/Table/CopyableCell";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import { TransactionTypeBadge } from "components/transaction/TransactionBadges";
import { Loadable } from "helpers/Loading";
import { Template } from "models/template";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";
import { lineNet } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface TemplatesTableProps {
	rows: Loadable<Template[]>;
	isFiltering: boolean;
	/** Whether any template exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onEdit: (template: Template) => void;
	onDelete: (template: Template) => void;
	onCreate: () => void;
}

/** Keep an inner entity link from also toggling the row's expand click. */
const stop = (e: React.MouseEvent) => e.stopPropagation();

const innerHeadSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "10px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	bgcolor: designTokens.gray25,
} as const;

const innerBodySx = {
	p: "10px 16px",
	borderBottom: "1px solid",
	borderColor: designTokens.gray25,
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

// Net line amount after the discount — branches on `discountType` (percentage vs
// fixed amount) via the shared `lineNet`, so a served Fixed discount no longer
// renders as a negative total (F4).
const lineTotal = (item: Template["items"][number]): number => lineNet(item);

const templateTotal = (template: Template): number =>
	template.items.reduce((s, it) => s + lineTotal(it), 0);

const EmptyState: React.FC<{ isFiltering: boolean; hasAny: boolean; onCreate: () => void }> = ({
	isFiltering,
	hasAny,
	onCreate,
}) => {
	const { t } = useTranslation();
	const empty = !hasAny && !isFiltering;

	return (
		<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: 2,
					mx: "auto",
					mb: 2,
					display: "grid",
					placeItems: "center",
					bgcolor: "grey.50",
					border: 1,
					borderColor: "divider",
					color: "text.disabled",
				}}
			>
				<LayersOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{empty ? t("template.empty.title") : t("template.empty.searchTitle")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 440, mx: "auto", lineHeight: 1.6 }}
			>
				{empty ? t("template.empty.body") : t("template.empty.searchBody")}
			</Typography>
			{empty && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("template.create")}
				</Button>
			)}
		</Box>
	);
};

/** The expand-row panel: the template's line items with the positions/total footer. */
const TemplateItemsDetail: React.FC<{ template: Template }> = ({ template }) => {
	const { t } = useTranslation();
	const total = templateTotal(template);

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<Box component="th" sx={innerHeadSx}>
							{t("template.itemsTable.product")}
						</Box>
						<Box component="th" sx={innerHeadSx}>
							{t("template.itemsTable.sku")}
						</Box>
						<Box component="th" sx={{ ...innerHeadSx, textAlign: "right" }}>
							{t("template.itemsTable.quantity")}
						</Box>
						<Box component="th" sx={innerHeadSx}>
							{t("template.itemsTable.unit")}
						</Box>
						<Box component="th" sx={{ ...innerHeadSx, textAlign: "right" }}>
							{t("template.itemsTable.unitPrice")}
						</Box>
						<Box component="th" sx={{ ...innerHeadSx, textAlign: "right" }}>
							{t("template.itemsTable.lineTotal")}
						</Box>
					</tr>
				</thead>
				<tbody>
					{template.items.map((item) => (
						<Box component="tr" key={item.id}>
							<Box component="td" sx={innerBodySx}>
								<Box component="span" sx={{ fontWeight: 600 }}>
									<ProductLink id={item.productId} name={item.productName} />
								</Box>
							</Box>
							<Box component="td" sx={innerBodySx}>
								<CopyableCell
									value={item.sku}
									sx={{ ...numericSx, fontSize: 12.5, color: "text.disabled" }}
								>
									{item.sku}
								</CopyableCell>
							</Box>
							<Box component="td" sx={{ ...innerBodySx, textAlign: "right" }}>
								<Box component="span" sx={numericSx}>
									{formatQuantity(item.quantity)}
								</Box>
								{item.packageSize && item.packageSize > 0 && (
									<Box sx={{ fontSize: 11, color: "text.disabled" }}>
										{Math.round(item.quantity / item.packageSize)}{" "}
										{t("transaction.new.line.packShort")}
									</Box>
								)}
							</Box>
							<Box component="td" sx={innerBodySx}>
								<Box component="span" sx={{ color: "text.secondary" }}>
									{MEASUREMENT_SHORT[item.measurement]}
								</Box>
							</Box>
							<Box component="td" sx={{ ...innerBodySx, textAlign: "right" }}>
								<Box component="span" sx={numericSx}>
									{formatCurrency(item.unitPrice)}
								</Box>
							</Box>
							<Box component="td" sx={{ ...innerBodySx, textAlign: "right" }}>
								<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
									{formatCurrency(lineTotal(item))}
								</Box>
							</Box>
						</Box>
					))}
				</tbody>
				<tfoot>
					<tr>
						<Box
							component="td"
							colSpan={5}
							sx={{
								p: "13px 16px",
								borderTop: "1px solid",
								borderColor: designTokens.gray300,
								bgcolor: designTokens.gray25,
								fontWeight: 700,
								fontSize: 14,
							}}
						>
							{t("template.itemsTable.footer", {
								count: template.items.length,
							})}
						</Box>
						<Box
							component="td"
							sx={{
								p: "13px 16px",
								borderTop: "1px solid",
								borderColor: designTokens.gray300,
								bgcolor: designTokens.gray25,
								textAlign: "right",
							}}
						>
							<Box component="span" sx={{ ...numericSx, fontWeight: 800, fontSize: 16 }}>
								{formatCurrency(total)}
							</Box>
							<Box
								component="span"
								sx={{ ml: "4px", fontSize: 12, fontWeight: 600, color: "text.disabled" }}
							>
								UZS
							</Box>
						</Box>
					</tr>
				</tfoot>
			</Box>
		</Paper>
	);
};

/**
 * Templates list on the shared ExpandableDataTable (warm bands, sortable
 * columns, 10/25/50 pagination) — the per-row expand panel reveals the line
 * items. A template is a mutable basket, so Edit/Delete live in the shared ⋮
 * ActionMenu; the partner and product cells deep-link to their detail pages.
 */
export const TemplatesTable: React.FC<TemplatesTableProps> = ({
	rows,
	isFiltering,
	hasAny,
	onEdit,
	onDelete,
	onCreate,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<Template>[]>(
		() => [
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
				renderCell: (tp) => (
					<Box component="span" onClick={stop} sx={{ whiteSpace: "nowrap" }}>
						<PartnerLink id={tp.partnerId} name={tp.partnerName} />
					</Box>
				),
			},
			{
				key: "positions",
				headerName: t("template.table.positions"),
				align: "right",
				sortValue: (tp) => tp.items.length,
				renderCell: (tp) => (
					<Box component="span" sx={numericSx}>
						{tp.items.length}
					</Box>
				),
			},
			{
				key: "total",
				headerName: t("template.table.total"),
				align: "right",
				sortValue: (tp) => templateTotal(tp),
				renderCell: (tp) => (
					<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
						{formatCurrency(templateTotal(tp))}
					</Box>
				),
			},
			{
				key: "lastUsed",
				headerName: t("template.table.lastUsed"),
				sortValue: (tp) => tp.lastUsedAt ?? null,
				renderCell: (tp) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{tp.lastUsedAt ? formatDate(tp.lastUsedAt) : "—"}
					</Box>
				),
			},
			{
				key: "actions",
				headerName: "",
				align: "right",
				width: 56,
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
		],
		[t, onEdit, onDelete],
	);

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (rows.length === 0) {
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<EmptyState isFiltering={isFiltering} hasAny={hasAny} onCreate={onCreate} />
			</Paper>
		);
	}

	return (
		<ExpandableDataTable<Template>
			rows={rows}
			columns={columns}
			pagination
			defaultSort={{ key: "name", order: "asc" }}
			renderExpanded={(template) => <TemplateItemsDetail template={template} />}
			expandOnRowClick
			expandedMaxHeight={480}
		/>
	);
};

export default TemplatesTable;
