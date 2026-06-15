import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import TablePager from "components/shared/Table/TablePager";
import TemplateActionsMenu from "components/template/TemplateActionsMenu";
import TemplateTypeChip from "components/template/TemplateTypeChip";
import { Loadable } from "helpers/Loading";
import { Template } from "models/template";
import { partnerDetailPath } from "routing/paths";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box, Button, CircularProgress, Collapse, Paper, Typography } from "@mui/material";

interface TemplatesTableProps {
	rows: Loadable<Template[]>;
	isFiltering: boolean;
	/** Whether any template exists at all (drives the empty-state copy). */
	hasAny: boolean;
	onEdit: (template: Template) => void;
	onDelete: (template: Template) => void;
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

const innerHeadSx = {
	textAlign: "left",
	fontSize: 11.5,
	fontWeight: 600,
	letterSpacing: ".03em",
	textTransform: "uppercase",
	color: "text.disabled",
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	bgcolor: designTokens.gray25,
} as const;

const innerBodySx = {
	p: "11px 16px",
	borderBottom: "1px solid",
	borderColor: "divider",
	fontSize: 14,
	verticalAlign: "middle",
} as const;

/** Pluralised «позиция/позиции/позиций» for the expand-row footer. */
function positionsWord(n: number): string {
	const m10 = n % 10;
	const m100 = n % 100;
	if (m10 === 1 && m100 !== 11) return "позиция";
	if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "позиции";
	return "позиций";
}

const lineTotal = (item: Template["items"][number]): number =>
	item.quantity * item.unitPrice * (1 - (item.discount ?? 0) / 100);

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

/**
 * Templates list per the bundle: a table with an expandable detail row per
 * template that reveals its line items. The partner cell links to the partner
 * detail page; row actions (Edit · Delete) live in a ⋮ menu. Bespoke because the
 * shared DataTable can't carry accordion rows.
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
	const navigate = useNavigate();
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(25);

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
									{t("template.table.name")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("template.table.type")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("template.table.partner")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("template.table.positions")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, textAlign: "right" }}>
									{t("template.table.total")}
								</Box>
								<Box component="th" sx={headCellSx}>
									{t("template.table.lastUsed")}
								</Box>
								<Box component="th" sx={{ ...headCellSx, width: 56 }} />
							</tr>
						</thead>
						<tbody>
							{paged.map((template) => {
								const open = expandedId === template.id;
								const total = template.items.reduce((s, it) => s + lineTotal(it), 0);
								return (
									<React.Fragment key={template.id}>
										<Box
											component="tr"
											onClick={() => setExpandedId(open ? null : template.id)}
											sx={{
												cursor: "pointer",
												bgcolor: open ? designTokens.primarySoft : "transparent",
												"&:hover": {
													bgcolor: open ? designTokens.primarySoft : designTokens.gray25,
												},
											}}
										>
											<Box component="td" sx={{ ...bodyCellSx, pl: "14px" }}>
												<Box
													sx={{
														width: 26,
														height: 26,
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
													sx={{ fontWeight: 600, color: open ? "primary.main" : "text.primary" }}
												>
													{template.name}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<TemplateTypeChip type={template.type} />
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box
													component="span"
													onClick={(e) => {
														e.stopPropagation();
														navigate(partnerDetailPath(template.partnerId));
													}}
													sx={{
														color: "primary.main",
														cursor: "pointer",
														whiteSpace: "nowrap",
														"&:hover": { textDecoration: "underline" },
													}}
												>
													{template.partnerName}
												</Box>
											</Box>
											<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
												<Box component="span" sx={numericSx}>
													{template.items.length}
												</Box>
											</Box>
											<Box component="td" sx={{ ...bodyCellSx, textAlign: "right" }}>
												<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
													{formatCurrency(total)}
												</Box>
											</Box>
											<Box component="td" sx={bodyCellSx}>
												<Box
													component="span"
													sx={{ ...numericSx, color: "text.secondary", whiteSpace: "nowrap" }}
												>
													{template.lastUsedAt ? formatDate(template.lastUsedAt) : "—"}
												</Box>
											</Box>
											<Box
												component="td"
												sx={{ ...bodyCellSx, textAlign: "right", pr: "8px" }}
												onClick={(e) => e.stopPropagation()}
											>
												<TemplateActionsMenu
													template={template}
													onEdit={onEdit}
													onDelete={onDelete}
												/>
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
															p: "16px 20px 20px",
														}}
													>
														<Paper
															elevation={1}
															sx={{
																border: 1,
																borderColor: "divider",
																borderRadius: "12px",
																overflow: "hidden",
															}}
														>
															<Box
																component="table"
																sx={{ width: "100%", borderCollapse: "collapse" }}
															>
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
																					{item.productName}
																				</Box>
																			</Box>
																			<Box component="td" sx={innerBodySx}>
																				<Box
																					component="span"
																					sx={{
																						...numericSx,
																						fontSize: 12.5,
																						color: "text.disabled",
																					}}
																				>
																					{item.sku}
																				</Box>
																			</Box>
																			<Box
																				component="td"
																				sx={{ ...innerBodySx, textAlign: "right" }}
																			>
																				<Box component="span" sx={numericSx}>
																					{formatQuantity(item.quantity)}
																				</Box>
																			</Box>
																			<Box component="td" sx={innerBodySx}>
																				<Box component="span" sx={{ color: "text.secondary" }}>
																					{MEASUREMENT_SHORT[item.measurement]}
																				</Box>
																			</Box>
																			<Box
																				component="td"
																				sx={{ ...innerBodySx, textAlign: "right" }}
																			>
																				<Box component="span" sx={numericSx}>
																					{formatCurrency(item.unitPrice)}
																				</Box>
																			</Box>
																			<Box
																				component="td"
																				sx={{ ...innerBodySx, textAlign: "right" }}
																			>
																				<Box
																					component="span"
																					sx={{ ...numericSx, fontWeight: 700 }}
																				>
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
																				word: positionsWord(template.items.length),
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
																			<Box
																				component="span"
																				sx={{ ...numericSx, fontWeight: 800, fontSize: 16 }}
																			>
																				{formatCurrency(total)}
																			</Box>
																			<Box
																				component="span"
																				sx={{
																					ml: "4px",
																					fontSize: 12,
																					fontWeight: 600,
																					color: "text.disabled",
																				}}
																			>
																				UZS
																			</Box>
																		</Box>
																	</tr>
																</tfoot>
															</Box>
														</Paper>
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

export default TemplatesTable;
