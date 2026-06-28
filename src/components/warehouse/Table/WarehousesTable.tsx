import React from "react";
import { useTranslation } from "react-i18next";
import ArchivedBadge from "components/shared/ArchivedBadge/ArchivedBadge";
import { WarehouseActionMenu } from "components/warehouse/Table/ActionMenu/WarehouseActionMenu";
import { Loadable } from "helpers/Loading";
import { Warehouse } from "models/warehouse";
import { WarehouseTotals } from "stores/WarehouseStore";
import { designTokens, numericSx } from "theme";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import AddIcon from "@mui/icons-material/Add";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Button, Paper, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

interface WarehousesTableProps {
	rows: Loadable<Warehouse[]>;
	totals: WarehouseTotals;
	showArchived: boolean;
	isFiltering: boolean;
	/** Whether any warehouse exists at all (drives the empty-state copy). */
	hasAny: boolean;
	/** Whether any active (non-archived) warehouse exists. */
	hasActive: boolean;
	onOpen: (warehouse: Warehouse) => void;
	onCreate: () => void;
	onEdit: (warehouse: Warehouse) => void;
	onArchive: (warehouse: Warehouse) => void;
	onRestore: (warehouse: Warehouse) => void;
}

const headCellSx = {
	textAlign: "left",
	fontSize: 12,
	fontWeight: 600,
	color: "text.secondary",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
	bgcolor: "background.paper",
} as const;

const bodyCellSx = {
	p: "13px 16px",
	borderBottom: "1px solid",
	// Visible row separator (the design's `.dtable` rows are clearly divided);
	// the near-invisible gray-25 hairline read as no separator at all.
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

const UzsSuffix: React.FC = () => (
	<Box component="span" sx={{ color: "text.disabled", fontWeight: 600, fontSize: 12, ml: "4px" }}>
		UZS
	</Box>
);

const EmptyState: React.FC<{
	variant: "filtering" | "empty" | "allArchived";
	onCreate: () => void;
}> = ({ variant, onCreate }) => {
	const { t } = useTranslation();

	const copy = {
		filtering: { title: t("warehouse.empty.searchTitle"), body: t("warehouse.empty.searchBody") },
		empty: { title: t("warehouse.empty.title"), body: t("warehouse.empty.body") },
		allArchived: {
			title: t("warehouse.empty.allArchivedTitle"),
			body: t("warehouse.empty.allArchivedBody"),
		},
	}[variant];

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
				<WarehouseOutlinedIcon sx={{ fontSize: 26 }} />
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{copy.title}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
			>
				{copy.body}
			</Typography>
			{variant === "empty" && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("warehouse.create")}
				</Button>
			)}
		</Box>
	);
};

/**
 * Warehouse list per the bundle: a single static table (name · address · product
 * count · units · stock value) with a bold «Итого» summary row and no
 * pagination. The shared DataTable can't carry a totals row, so — like the
 * detail tables — this is a bespoke table styled from theme tokens.
 */
export const WarehousesTable: React.FC<WarehousesTableProps> = ({
	rows,
	totals,
	showArchived,
	isFiltering,
	hasAny,
	hasActive,
	onOpen,
	onCreate,
	onEdit,
	onArchive,
	onRestore,
}) => {
	const { t } = useTranslation();

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const emptyVariant = isFiltering
		? "filtering"
		: !hasAny
			? "empty"
			: !hasActive && !showArchived
				? "allArchived"
				: "filtering";

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			{rows.length === 0 ? (
				<EmptyState variant={emptyVariant} onCreate={onCreate} />
			) : (
				<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<Box component="th" sx={{ ...headCellSx, pl: "18px" }}>
								{t("warehouse.table.name")}
							</Box>
							<Box component="th" sx={headCellSx}>
								{t("warehouse.table.address")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
								{t("warehouse.table.products")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
								{t("warehouse.table.units")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, textAlign: "right", pr: "8px" }}>
								{t("warehouse.table.stockValue")}
							</Box>
							<Box component="th" sx={{ ...headCellSx, width: 56 }} />
						</tr>
					</thead>
					<tbody>
						{rows.map((warehouse) => {
							const archived = warehouse.isArchived;
							const dim = archived ? { opacity: 0.6 } : undefined;
							return (
								<Box
									component="tr"
									key={warehouse.id}
									onClick={() => onOpen(warehouse)}
									sx={{
										cursor: "pointer",
										"&:hover": { bgcolor: designTokens.gray25 },
									}}
								>
									<Box component="td" sx={{ ...bodyCellSx, pl: "18px" }}>
										<Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
											<Box
												sx={{
													width: 36,
													height: 36,
													flex: "0 0 auto",
													borderRadius: "8px",
													display: "inline-grid",
													placeItems: "center",
													bgcolor: "primary.light",
													color: "primary.main",
													opacity: archived ? 0.5 : 1,
												}}
											>
												<WarehouseOutlinedIcon sx={{ fontSize: 18 }} />
											</Box>
											<Typography
												component="span"
												sx={{
													fontWeight: 600,
													color: archived ? "text.secondary" : "primary.main",
													textDecoration: archived ? "line-through" : "none",
													"tr:hover &": archived ? undefined : { textDecoration: "underline" },
												}}
											>
												{warehouse.name}
											</Typography>
											{archived && <ArchivedBadge />}
										</Box>
									</Box>
									<Box component="td" sx={bodyCellSx}>
										{warehouse.location ? (
											<Box
												component="span"
												sx={{
													display: "inline-flex",
													alignItems: "center",
													gap: "7px",
													color: "text.secondary",
													whiteSpace: "nowrap",
													...dim,
												}}
											>
												<PlaceOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
												{warehouse.location}
											</Box>
										) : (
											<Box component="span" sx={{ color: "text.disabled", ...dim }}>
												—
											</Box>
										)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											color: designTokens.gray700,
											...dim,
										}}
									>
										{formatQuantity(warehouse.productCount)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											...numericSx,
											fontWeight: 600,
											...dim,
										}}
									>
										{formatQuantity(warehouse.totalUnits)}
									</Box>
									<Box
										component="td"
										sx={{
											...bodyCellSx,
											textAlign: "right",
											pr: "8px",
											...numericSx,
											fontWeight: 700,
											...dim,
										}}
									>
										{formatCurrency(warehouse.stockValue)}
										<UzsSuffix />
									</Box>
									<Box
										component="td"
										sx={{ ...bodyCellSx, textAlign: "right" }}
										onClick={(e) => e.stopPropagation()}
									>
										<WarehouseActionMenu
											warehouse={warehouse}
											onEdit={() => onEdit(warehouse)}
											onArchive={() => onArchive(warehouse)}
											onRestore={() => onRestore(warehouse)}
										/>
									</Box>
								</Box>
							);
						})}

						<Box component="tr" sx={{ bgcolor: designTokens.gray25 }}>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									pl: "18px",
									fontWeight: 700,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							>
								{t("warehouse.table.total")}
								{showArchived && (
									<Box
										component="span"
										sx={{ color: "text.disabled", fontWeight: 500, fontSize: 12, ml: "6px" }}
									>
										{t("warehouse.table.totalWithArchived")}
									</Box>
								)}
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							/>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									textAlign: "right",
									...numericSx,
									fontWeight: 800,
									color: designTokens.gray700,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							>
								{formatQuantity(totals.productCount)}
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									textAlign: "right",
									...numericSx,
									fontWeight: 800,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							>
								{formatQuantity(totals.totalUnits)}
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									textAlign: "right",
									pr: "8px",
									...numericSx,
									fontWeight: 800,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							>
								{formatCurrency(totals.stockValue)}
								<UzsSuffix />
							</Box>
							<Box
								component="td"
								sx={{
									...bodyCellSx,
									borderTop: "1.5px solid",
									borderTopColor: designTokens.gray300,
									borderBottom: "none",
								}}
							/>
						</Box>
					</tbody>
				</Box>
			)}
		</Paper>
	);
};

export default WarehousesTable;
