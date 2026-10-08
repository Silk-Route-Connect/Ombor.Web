import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import LoadStateView from "components/shared/LoadState/LoadStateView";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import StockLevelPill from "components/warehouse/Stock/StockLevelPill";
import { isReady, Loadable } from "helpers/Loading";
import { StockReport, StockReportRow } from "models/report";
import { figuresSx, radius } from "theme";
import { formatQuantity } from "utils/formatCurrency";
import { measurementShort } from "utils/productUtils";
import { lowStockRows, stockRowLevel } from "utils/stockLevel";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Paper, Typography } from "@mui/material";

/** Enough to act on at a glance; «Все» opens the full filtered list. */
const SHOWN = 6;

interface LowStockPanelProps {
	/** Today's stock report over every warehouse (served flags and count). */
	report: Loadable<StockReport>;
	onRetry: () => void;
	/** The stock report filtered «Остаток: Заканчивается» over every warehouse. */
	onAll: () => void;
}

/**
 * «Заканчивается» — the warehouse rows the server flags (a threshold set on the
 * product in that warehouse, quantity at or below it — DR-41), the emptiest
 * first: product · warehouse · left · threshold. «Все» opens the same rows in
 * the stock report. Until a threshold is set anywhere, the panel says where
 * thresholds are set instead of «all is well».
 */
const LowStockPanel: React.FC<LowStockPanelProps> = ({ report, onRetry, onAll }) => {
	const { t } = useTranslation();
	const rows = useMemo(() => (isReady(report) ? lowStockRows(report.rows) : []), [report]);
	const tracksAny = isReady(report) && report.rows.some((row) => row.lowStockThreshold != null);

	const unitQty = (value: number, row: StockReportRow) =>
		`${formatQuantity(value)} ${measurementShort(t, row.measurement)}`.trim();

	return (
		<Paper
			elevation={1}
			sx={{
				border: 1,
				borderColor: "divider",
				borderRadius: `${radius.lg}px`,
				overflow: "hidden",
				mt: "16px",
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "6px 14px",
					p: "16px 20px",
				}}
			>
				<Typography variant="h3" component="h2">
					{t("dashboard.lowStock.title")}
				</Typography>
				{isReady(report) && report.totals.lowStockCount > 0 && (
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						{t("dashboard.lowStock.summary", {
							count: report.totals.lowStockCount,
							formatted: formatQuantity(report.totals.lowStockCount),
						})}
					</Typography>
				)}
				<ButtonBase
					onClick={onAll}
					sx={{
						ml: "auto",
						gap: "4px",
						px: "6px",
						borderRadius: `${radius.sm}px`,
						fontFamily: "inherit",
						fontSize: 13,
						fontWeight: 600,
						color: "primary.main",
						"&:hover": { color: "primary.dark" },
					}}
				>
					{t("dashboard.lowStock.all")}
					<ChevronRightIcon sx={{ fontSize: 16 }} />
				</ButtonBase>
			</Box>

			{!isReady(report) ? (
				<LoadStateView
					state={report}
					size="section"
					onRetry={onRetry}
					errorTitle={t("report.error.load.stock")}
				/>
			) : rows.length === 0 ? (
				<Typography variant="body2" sx={{ p: "0 20px 18px", color: "text.secondary" }}>
					{t(tracksAny ? "dashboard.lowStock.empty" : "dashboard.lowStock.untracked")}
				</Typography>
			) : (
				<Box
					sx={{
						display: "grid",
						// Three tiles a row on a wide screen, two on a laptop: the six alerts fill
						// whole rows, and a tile is wide enough for the product name.
						gridTemplateColumns: {
							xs: "minmax(0, 1fr)",
							md: "repeat(2, minmax(0, 1fr))",
							xl: "repeat(3, minmax(0, 1fr))",
						},
						borderTop: 1,
						borderColor: "divider",
						// The last row's hairline sits under the panel's own border.
						mb: "-1px",
					}}
				>
					{rows.slice(0, SHOWN).map((row) => (
						<Box
							key={`${row.warehouseId}-${row.productId}`}
							sx={{ p: "12px 20px", minWidth: 0, borderBottom: 1, borderColor: "divider" }}
						>
							<Box
								sx={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									typography: "body1",
								}}
							>
								<ProductLink id={row.productId} name={row.productName} />
							</Box>
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									mt: "6px",
									minWidth: 0,
								}}
							>
								<StockLevelPill level={stockRowLevel(row)} />
								<Typography
									variant="caption"
									noWrap
									sx={{ ...figuresSx, color: "text.secondary", minWidth: 0 }}
								>
									<WarehouseLink
										id={row.warehouseId}
										name={row.warehouseName}
										variant="secondary"
									/>
									{" · "}
									{t("dashboard.lowStock.leftOfThreshold", {
										qty: unitQty(row.quantity, row),
										threshold: unitQty(row.lowStockThreshold ?? 0, row),
									})}
								</Typography>
							</Box>
						</Box>
					))}
				</Box>
			)}
		</Paper>
	);
};

export default LowStockPanel;
