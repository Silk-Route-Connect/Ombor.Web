import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import {
	Column,
	ExpandableDataTable,
} from "components/shared/Table/ExpandableDataTable/ExpandableDataTable";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Loadable } from "helpers/Loading";
import { StockAdjustment } from "models/stockAdjustment";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Avatar, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface StockAdjustmentsTableProps {
	rows: Loadable<StockAdjustment[]>;
	isFiltering: boolean;
	/** Whether any adjustment exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
}

/** Local time-of-day (HH:mm) for the audited timestamp shown in the expand row. */
function timeOf(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const ExpandField: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({
	label,
	children,
	mono,
}) => (
	<Box>
		<Typography sx={{ fontSize: 11.5, color: "text.secondary", mb: "5px" }}>{label}</Typography>
		<Typography
			component="div"
			sx={{ fontSize: 13.5, color: "text.primary", fontWeight: 500, ...(mono ? numericSx : null) }}
		>
			{children}
		</Typography>
	</Box>
);

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
				<ScaleOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{empty ? t("adjustment.empty.title") : t("adjustment.empty.searchTitle")}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 420, mx: "auto", lineHeight: 1.6 }}
			>
				{empty ? t("adjustment.empty.body") : t("adjustment.empty.searchBody")}
			</Typography>
			{empty && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("adjustment.create")}
				</Button>
			)}
		</Box>
	);
};

/** The expand-row detail panel: the audited fields the row doesn't surface (rule 23). */
const AdjustmentDetail: React.FC<{ adjustment: StockAdjustment }> = ({ adjustment }) => {
	const { t } = useTranslation();
	const unit = MEASUREMENT_SHORT[adjustment.measurement];

	return (
		<Box sx={{ p: "4px 6px 10px" }}>
			<Box
				sx={{
					p: "16px 18px",
					borderLeft: "2px solid",
					borderLeftColor: "primary.main",
					bgcolor: "background.default",
					borderRadius: "0 8px 8px 0",
				}}
			>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
						gap: "18px 28px",
					}}
				>
					<ExpandField label={t("adjustment.table.sku")} mono>
						{adjustment.sku}
					</ExpandField>
					<ExpandField label={t("adjustment.table.category")}>
						{adjustment.categoryName ?? "—"}
					</ExpandField>
					<ExpandField label={t("adjustment.detail.dateTime")} mono>
						{formatDate(adjustment.date)}, {timeOf(adjustment.date)}
					</ExpandField>
					<ExpandField label={t("adjustment.detail.balanceAfter")} mono>
						{formatQuantity(adjustment.balanceAfter)} {unit}
					</ExpandField>
					<ExpandField label={t("adjustment.table.reason")}>
						{t(`adjustment.reason.${adjustment.reason}`)}
					</ExpandField>
					<ExpandField label={t("adjustment.detail.createdBy")}>
						<Box sx={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
							<Avatar
								sx={{
									width: 22,
									height: 22,
									fontSize: 11,
									fontWeight: 700,
									bgcolor: "primary.light",
									color: "primary.main",
								}}
							>
								{adjustment.createdBy.trim().charAt(0)}
							</Avatar>
							<Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
								{adjustment.createdBy}
							</Box>
						</Box>
					</ExpandField>
					<Box
						sx={{
							gridColumn: "1 / -1",
							display: "flex",
							alignItems: "flex-start",
							gap: "8px",
							p: "11px 14px",
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "8px",
							fontSize: 13,
							color: designTokens.gray700,
							lineHeight: 1.55,
						}}
					>
						<ReceiptLongOutlinedIcon sx={{ fontSize: 15, color: "text.disabled", mt: "1px" }} />
						{adjustment.note ?? (
							<Box component="span" sx={{ color: "text.disabled" }}>
								{t("adjustment.detail.noNote")}
							</Box>
						)}
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

/**
 * Immutable stock-adjustment history (rule 23 — no edit / delete): the shared
 * ExpandableDataTable (warm bands, sort, 10/25/50 pagination) with a per-row
 * expand panel carrying the audited detail. Product + warehouse cells deep-link
 * (ADJ-2); direction is a chip, the signed quantity keeps its ledger +/− colour.
 */
export const StockAdjustmentsTable: React.FC<StockAdjustmentsTableProps> = ({
	rows,
	isFiltering,
	hasAny,
	onCreate,
}) => {
	const { t } = useTranslation();

	const columns = useMemo<Column<StockAdjustment>[]>(
		() => [
			{
				key: "date",
				headerName: t("adjustment.table.date"),
				sortValue: (a) => a.date,
				renderCell: (a) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: designTokens.gray700, whiteSpace: "nowrap" }}
					>
						{formatDate(a.date)}
					</Box>
				),
			},
			{
				key: "warehouse",
				headerName: t("adjustment.table.warehouse"),
				sortValue: (a) => a.warehouseName,
				renderCell: (a) => (
					<Box sx={{ display: "inline-flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
						<WarehouseOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
						<WarehouseLink id={a.warehouseId} name={a.warehouseName} />
					</Box>
				),
			},
			{
				key: "product",
				headerName: t("adjustment.table.product"),
				sortValue: (a) => a.productName,
				renderCell: (a) => <ProductLink id={a.productId} name={a.productName} />,
			},
			{
				key: "direction",
				headerName: t("adjustment.table.direction"),
				sortValue: (a) => a.direction,
				renderCell: (a) => <DirectionChip direction={a.direction} />,
			},
			{
				key: "quantity",
				headerName: t("adjustment.table.quantity"),
				align: "right",
				sortValue: (a) => a.quantity,
				renderCell: (a) => {
					const isDown = a.direction === "Decrease";
					return (
						<Box
							component="span"
							sx={{
								...numericSx,
								fontWeight: 700,
								color: isDown ? "error.main" : "success.main",
							}}
						>
							{isDown ? "−" : "+"}
							{formatQuantity(a.quantity)} {MEASUREMENT_SHORT[a.measurement]}
						</Box>
					);
				},
			},
			{
				key: "reason",
				headerName: t("adjustment.table.reason"),
				sortValue: (a) => a.reason,
				renderCell: (a) => (
					<Box component="span" sx={{ color: designTokens.gray700 }}>
						{t(`adjustment.reason.${a.reason}`)}
					</Box>
				),
			},
			{
				key: "createdBy",
				headerName: t("adjustment.table.createdBy"),
				sortValue: (a) => a.createdBy,
				renderCell: (a) => (
					<Box component="span" sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
						{a.createdBy}
					</Box>
				),
			},
		],
		[t],
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
		<ExpandableDataTable<StockAdjustment>
			rows={rows}
			columns={columns}
			pagination
			rowsPerPageOptions={[10, 25, 50]}
			defaultSort={{ key: "date", order: "desc" }}
			renderExpanded={(adjustment) => <AdjustmentDetail adjustment={adjustment} />}
		/>
	);
};

export default StockAdjustmentsTable;
