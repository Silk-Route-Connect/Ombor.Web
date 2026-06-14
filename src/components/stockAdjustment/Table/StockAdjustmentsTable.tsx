import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TablePager from "components/shared/Table/TablePager";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import { Loadable } from "helpers/Loading";
import { StockAdjustment } from "models/stockAdjustment";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Avatar, Box, Button, CircularProgress, Collapse, Paper, Typography } from "@mui/material";

interface StockAdjustmentsTableProps {
	rows: Loadable<StockAdjustment[]>;
	isFiltering: boolean;
	/** Whether any adjustment exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onCreate: () => void;
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
	p: "12px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 13.5,
	verticalAlign: "middle",
} as const;

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

/**
 * Immutable stock-adjustment history per the bundle: a table with an expandable
 * detail row per record (no edit / delete — rule 23). Bespoke because the
 * shared DataTable can't carry accordion rows.
 */
export const StockAdjustmentsTable: React.FC<StockAdjustmentsTableProps> = ({
	rows,
	isFiltering,
	hasAny,
	onCreate,
}) => {
	const { t } = useTranslation();
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

	// Reset paging + collapse when the filtered set changes.
	useEffect(() => {
		setPage(0);
		setExpandedId(null);
	}, [rows]);

	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	return (
		<Paper
			elevation={1}
			sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
		>
			{rows.length === 0 ? (
				<EmptyState isFiltering={isFiltering} hasAny={hasAny} onCreate={onCreate} />
			) : (
				<>
					<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
						<thead>
							<tr>
								<Box component="th" sx={{ ...headCellSx, width: 44, pl: "14px" }} />
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.date")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.warehouse")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.product")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.direction")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("adjustment.table.quantity")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.reason")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("adjustment.table.createdBy")}
								</Box>
							</tr>
						</thead>
						<tbody>
							{paged.map((adjustment) => {
								const open = expandedId === adjustment.id;
								const unit = MEASUREMENT_SHORT[adjustment.measurement];
								const isDown = adjustment.direction === "Decrease";
								return (
									<React.Fragment key={adjustment.id}>
										<Box
											component="tr"
											onClick={() => setExpandedId(open ? null : adjustment.id)}
											sx={{ cursor: "pointer", "&:hover": { bgcolor: designTokens.gray25 } }}
										>
											<Box component="td" sx={{ ...bodyCellSx, pl: "14px" }}>
												<Box
													sx={{
														width: 24,
														height: 24,
														display: "grid",
														placeItems: "center",
														borderRadius: "6px",
														color: open ? "primary.main" : "text.disabled",
														bgcolor: open ? designTokens.primarySoft : "transparent",
														transition: "background-color .2s ease, color .2s ease",
													}}
												>
													<KeyboardArrowDownIcon
														sx={{
															fontSize: 18,
															transition: "transform .25s ease",
															transform: open ? "rotate(180deg)" : "rotate(0deg)",
														}}
													/>
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box
													component="span"
													sx={{ ...numericSx, color: designTokens.gray700, whiteSpace: "nowrap" }}
												>
													{formatDate(adjustment.date)}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box
													component="span"
													sx={{
														display: "inline-flex",
														alignItems: "center",
														gap: "7px",
														color: "text.secondary",
														whiteSpace: "nowrap",
													}}
												>
													<WarehouseOutlinedIcon sx={{ fontSize: 15, color: "text.disabled" }} />
													{adjustment.warehouseName}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box component="span" sx={{ fontWeight: 600 }}>
													{adjustment.productName}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<DirectionChip direction={adjustment.direction} />
											</Box>
											<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
												<Box
													component="span"
													sx={{
														...numericSx,
														fontWeight: 700,
														color: isDown ? "error.main" : "success.main",
													}}
												>
													{isDown ? "−" : "+"}
													{formatQuantity(adjustment.quantity)} {unit}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box component="span" sx={{ color: designTokens.gray700 }}>
													{t(`adjustment.reason.${adjustment.reason}`)}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box
													component="span"
													sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
												>
													{adjustment.createdBy}
												</Box>
											</Box>
										</Box>

										<Box component="tr">
											<Box component="td" colSpan={8} sx={{ p: 0, border: 0 }}>
												<Collapse in={open} timeout="auto" unmountOnExit>
													<Box
														sx={{
															bgcolor: "background.default",
															borderBottom: 1,
															borderColor: "divider",
														}}
													>
														<Box
															sx={{
																m: "8px 18px",
																p: "16px 18px",
																borderLeft: "2px solid",
																borderLeftColor: "primary.main",
															}}
														>
															<Box
																sx={{
																	display: "grid",
																	gridTemplateColumns: {
																		xs: "1fr",
																		sm: "repeat(3, minmax(0, 1fr))",
																	},
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
																	<Box
																		sx={{
																			display: "inline-flex",
																			alignItems: "center",
																			gap: "7px",
																		}}
																	>
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
																		<Box
																			component="span"
																			sx={{ color: "primary.main", fontWeight: 600 }}
																		>
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
																	<ReceiptLongOutlinedIcon
																		sx={{ fontSize: 15, color: "text.disabled", mt: "1px" }}
																	/>
																	{adjustment.note ?? (
																		<Box component="span" sx={{ color: "text.disabled" }}>
																			{t("adjustment.detail.noNote")}
																		</Box>
																	)}
																</Box>
															</Box>
														</Box>
													</Box>
												</Collapse>
											</Box>
										</Box>
									</React.Fragment>
								);
							})}
						</tbody>
					</Box>

					<TablePager
						count={rows.length}
						page={page}
						rowsPerPage={rowsPerPage}
						onPageChange={setPage}
						onRowsPerPageChange={(value) => {
							setRowsPerPage(value);
							setPage(0);
						}}
					/>
				</>
			)}
		</Paper>
	);
};

export default StockAdjustmentsTable;
