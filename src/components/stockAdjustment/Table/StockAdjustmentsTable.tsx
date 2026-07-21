import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import StockAdjustmentDetailModal from "components/stockAdjustment/Detail/StockAdjustmentDetailModal";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Loadable } from "helpers/Loading";
import { StockAdjustment } from "models/stockAdjustment";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface StockAdjustmentsTableProps {
	rows: Loadable<StockAdjustment[]>;
	isFiltering: boolean;
	/** Whether any adjustment exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
}

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

/**
 * Immutable stock-adjustment history (rule 23 — no edit / delete): the shared
 * DataTable (warm bands, sort, 10/25/50 pagination); a row click opens the
 * read-only audited detail in a modal. Product + warehouse cells deep-link
 * (ADJ-2); direction is a chip, the signed quantity keeps its ledger +/− colour.
 */
export const StockAdjustmentsTable: React.FC<StockAdjustmentsTableProps> = ({
	rows,
	isFiltering,
	hasAny,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [selected, setSelected] = useState<StockAdjustment | null>(null);

	const columns = useMemo<Column<StockAdjustment>[]>(
		() => [
			{
				key: "date",
				headerName: t("adjustment.table.date"),
				sortValue: (a) => a.date,
				renderCell: (a) => (
					<Box
						component="span"
						sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
					>
						{formatDateTime(a.date)}
					</Box>
				),
			},
			{
				key: "warehouse",
				headerName: t("adjustment.table.warehouse"),
				sortValue: (a) => a.warehouseName,
				renderCell: (a) => (
					// stopPropagation so the link navigates without opening the detail modal.
					<Box
						onClick={(e) => e.stopPropagation()}
						sx={{ display: "inline-flex", alignItems: "center", gap: "7px", minWidth: 0 }}
					>
						<WarehouseOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
						<WarehouseLink id={a.warehouseId} name={a.warehouseName} />
					</Box>
				),
			},
			{
				key: "product",
				headerName: t("adjustment.table.product"),
				sortValue: (a) => a.productName,
				renderCell: (a) => (
					<Box component="span" onClick={(e) => e.stopPropagation()}>
						<ProductLink id={a.productId} name={a.productName} />
					</Box>
				),
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
							{formatQuantity(a.quantity)}
							{/* Fixed-width, left-aligned unit so the numbers line up across rows
							    regardless of the unit label's width («шт» / «кг» / «т»). */}
							<Box
								component="span"
								sx={{
									color: "text.disabled",
									fontSize: 12,
									display: "inline-block",
									width: 26,
									ml: "4px",
									textAlign: "left",
								}}
							>
								{MEASUREMENT_SHORT[a.measurement]}
							</Box>
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
		<>
			<DataTable<StockAdjustment>
				rows={rows}
				columns={columns}
				pagination
				rowsPerPageOptions={[10, 25, 50]}
				defaultSort={{ key: "date", order: "desc" }}
				onRowClick={setSelected}
			/>
			<StockAdjustmentDetailModal adjustment={selected} onClose={() => setSelected(null)} />
		</>
	);
};

export default StockAdjustmentsTable;
