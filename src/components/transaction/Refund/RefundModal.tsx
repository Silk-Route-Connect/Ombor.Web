import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import MetaDot from "components/shared/Detail/MetaDot";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { CreateRefundRequest, TransactionRecord } from "models/transaction";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { directionOf, discountLabel, effectiveUnitPrice } from "utils/transactionUtils";

import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
	Alert,
	Box,
	Dialog,
	DialogActions,
	DialogContent,
	LinearProgress,
	TextField,
	Typography,
} from "@mui/material";

interface RefundModalProps {
	transaction: TransactionRecord;
	/** Prior refunds of this transaction — drives the already-refunded / available math. */
	priorRefunds?: TransactionRecord[];
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateRefundRequest) => void;
}

const headCellSx = {
	textAlign: "right",
	fontSize: 11,
	fontWeight: 600,
	color: "text.secondary",
	p: "10px 12px",
	bgcolor: designTokens.gray25,
	borderBottom: "1px solid",
	borderColor: "divider",
	whiteSpace: "nowrap",
} as const;

const bodyCellSx = {
	textAlign: "right",
	fontSize: 13.5,
	p: "11px 12px",
	borderBottom: "1px solid",
	borderColor: "divider",
	verticalAlign: "middle",
	...numericSx,
} as const;

const RefundModal: React.FC<RefundModalProps> = ({
	transaction,
	priorRefunds = [],
	isSaving,
	onClose,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const direction = directionOf(transaction.type);

	const ctx = useMemo(
		() =>
			transaction.lines.map((l) => {
				const refunded = priorRefunds.reduce(
					(sum, r) =>
						sum +
						r.lines
							.filter((rl) => rl.productName === l.productName)
							.reduce((s, rl) => s + rl.quantity, 0),
					0,
				);
				return {
					productId: l.productId,
					name: l.productName,
					unit: l.unit ?? "",
					sold: l.quantity,
					refunded,
					available: l.quantity - refunded,
					price: effectiveUnitPrice(l),
					disc: discountLabel(l),
				};
			}),
		[transaction.lines, priorRefunds],
	);

	const [rows, setRows] = useState(() => ctx.map(() => ({ checked: false, qty: "" })));
	const [reason, setReason] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [dirty, setDirty] = useState(false);

	const touch = () => setDirty(true);
	const setRow = (i: number, patch: Partial<{ checked: boolean; qty: string }>) => {
		setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
		touch();
	};
	const toggle = (i: number) => {
		if (rows[i].checked) {
			setRow(i, { checked: false, qty: "" });
		} else {
			setRow(i, { checked: true, qty: String(Math.max(ctx[i].available, 0)) });
		}
	};

	const evalRow = (i: number) => {
		const r = rows[i];
		const c = ctx[i];
		const qty = r.qty === "" ? 0 : Number(r.qty);
		const over = r.checked && qty > c.available;
		const amount = r.checked && !over ? qty * c.price : 0;
		return { qty, over, amount };
	};

	const selected = rows
		.map((r, i) => ({ r, c: ctx[i], e: evalRow(i) }))
		.filter((x) => x.r.checked && x.e.qty > 0);
	const anyOver = rows.some((_, i) => evalRow(i).over);
	const totalAmount = selected.reduce((a, x) => a + x.e.amount, 0);
	const posCount = selected.length;

	const reasonErr = submitted && reason.trim() === "";
	const noLines = submitted && posCount === 0;

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		dirty,
		isSaving,
		onClose,
	);

	const submit = () => {
		setSubmitted(true);
		if (posCount === 0 || anyOver || reason.trim() === "") {
			return;
		}
		onSubmit({
			reason: reason.trim(),
			lines: selected.map((x) => ({
				productId: x.c.productId,
				productName: x.c.name,
				quantity: x.e.qty,
				unitPrice: x.c.price,
			})),
		});
	};

	return (
		<>
			<Dialog
				open
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: { width: 820, maxWidth: "96%", borderRadius: "12px" } } }}
			>
				<FormDialogHeader
					title={t(`transaction.refund.title.${direction}`, {
						number: transaction.transactionNumber,
					})}
					disabled={isSaving}
					onClose={requestClose}
				/>
				<Box
					sx={{
						px: "24px",
						pb: "4px",
						mt: "-8px",
						display: "flex",
						alignItems: "center",
						gap: "8px",
						flexWrap: "wrap",
						fontSize: 12.5,
						color: "text.secondary",
					}}
				>
					<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
						<PersonOutlineIcon sx={{ fontSize: 13, color: "text.disabled" }} />
						{transaction.partnerName}
					</Box>
					<MetaDot />
					<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
						<WarehouseOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
						{transaction.warehouseName}
					</Box>
					<MetaDot />
					<Box
						component="span"
						sx={{ display: "inline-flex", alignItems: "center", gap: "5px", ...numericSx }}
					>
						<EventOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />
						{formatDate(transaction.date)}
					</Box>
				</Box>

				{isSaving && <LinearProgress />}

				<DialogContent dividers sx={{ pt: 2 }}>
					{(noLines || anyOver) && (
						<Alert
							severity="error"
							icon={<ErrorOutlineIcon />}
							variant="outlined"
							sx={{ mb: "16px" }}
						>
							{noLines ? t("transaction.refund.noLinesBanner") : t("transaction.refund.overBanner")}
						</Alert>
					)}

					<Typography
						sx={{
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.07em",
							textTransform: "uppercase",
							color: "text.disabled",
							mb: "10px",
						}}
					>
						{t("transaction.refund.sectionLabel")}
					</Typography>

					<Box
						sx={{
							border: "1px solid",
							borderColor: "divider",
							borderRadius: "12px",
							overflow: "hidden",
						}}
					>
						<Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
							<thead>
								<tr>
									<Box
										component="th"
										sx={{ ...headCellSx, width: 44, textAlign: "left", pl: "16px" }}
									/>
									<Box component="th" sx={{ ...headCellSx, textAlign: "left" }}>
										{t("transaction.refund.col.product")}
									</Box>
									<Box component="th" sx={headCellSx}>
										{t("transaction.refund.col.sold")}
									</Box>
									<Box component="th" sx={headCellSx}>
										{t("transaction.refund.col.refunded")}
									</Box>
									<Box component="th" sx={headCellSx}>
										{t("transaction.refund.col.available")}
									</Box>
									<Box component="th" sx={{ ...headCellSx, width: 122 }}>
										{t("transaction.refund.col.toRefund")}
									</Box>
									<Box component="th" sx={headCellSx}>
										{t("transaction.refund.col.unitPrice")}
									</Box>
									<Box component="th" sx={headCellSx}>
										{t("transaction.refund.col.amount")}
									</Box>
								</tr>
							</thead>
							<tbody>
								{ctx.map((c, i) => {
									const r = rows[i];
									const e = evalRow(i);
									const noneLeft = c.available <= 0;
									const rowBg = e.over
										? designTokens.errorBg
										: r.checked
											? designTokens.gray25
											: "transparent";
									return (
										<React.Fragment key={i}>
											<Box component="tr" sx={{ "& td": { bgcolor: rowBg } }}>
												<Box component="td" sx={{ ...bodyCellSx, textAlign: "left", pl: "16px" }}>
													<Box
														onClick={() => toggle(i)}
														sx={{
															width: 20,
															height: 20,
															borderRadius: "6px",
															display: "inline-grid",
															placeItems: "center",
															cursor: "pointer",
															border: "1.5px solid",
															color: "#fff",
															...(r.checked
																? { bgcolor: "primary.main", borderColor: "primary.main" }
																: {
																		bgcolor: "background.paper",
																		borderColor: designTokens.gray300,
																	}),
														}}
													>
														{r.checked && <CheckIcon sx={{ fontSize: 13 }} />}
													</Box>
												</Box>
												<Box
													component="td"
													sx={{ ...bodyCellSx, textAlign: "left", fontFamily: "inherit" }}
												>
													<Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</Typography>
													{c.disc && (
														<Typography
															sx={{ fontSize: 11.5, color: designTokens.saffron700, mt: "2px" }}
														>
															{t("transaction.refund.discountedPrice", { disc: c.disc })}
														</Typography>
													)}
												</Box>
												<Box component="td" sx={bodyCellSx}>
													{c.sold}{" "}
													<Box component="span" sx={{ color: "text.disabled", fontSize: 11.5 }}>
														{c.unit}
													</Box>
												</Box>
												<Box
													component="td"
													sx={{
														...bodyCellSx,
														color: c.refunded ? designTokens.gray700 : "text.disabled",
														fontWeight: c.refunded ? 600 : 400,
													}}
												>
													{c.refunded || "—"}
												</Box>
												<Box
													component="td"
													sx={{
														...bodyCellSx,
														fontWeight: 700,
														color: noneLeft ? "text.disabled" : "text.primary",
													}}
												>
													{Math.max(c.available, 0)}{" "}
													<Box component="span" sx={{ color: "text.disabled", fontSize: 11.5 }}>
														{c.unit}
													</Box>
												</Box>
												<Box component="td" sx={{ ...bodyCellSx, width: 122 }}>
													{r.checked ? (
														<Box
															sx={{
																display: "inline-flex",
																alignItems: "center",
																gap: "6px",
																px: "10px",
																py: "5px",
																ml: "auto",
																maxWidth: 104,
																border: "1px solid",
																borderRadius: "6px",
																bgcolor: e.over ? designTokens.errorBg : "background.paper",
																borderColor: e.over ? "error.main" : designTokens.gray300,
																"&:focus-within": { borderColor: "primary.main" },
															}}
														>
															<Box
																component="input"
																inputMode="numeric"
																value={r.qty}
																onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
																	setRow(i, { qty: ev.target.value.replace(/[^\d]/g, "") })
																}
																sx={{
																	...numericSx,
																	width: 44,
																	border: "none",
																	outline: "none",
																	background: "none",
																	fontWeight: 700,
																	fontSize: 14,
																	textAlign: "right",
																	fontFamily: "inherit",
																	color: e.over ? "error.main" : "text.primary",
																}}
															/>
															<Box component="span" sx={{ color: "text.disabled", fontSize: 11.5 }}>
																{c.unit}
															</Box>
														</Box>
													) : (
														<Box component="span" sx={{ color: "text.disabled" }}>
															—
														</Box>
													)}
												</Box>
												<Box component="td" sx={bodyCellSx}>
													{formatCurrency(c.price)}
												</Box>
												<Box
													component="td"
													sx={{
														...bodyCellSx,
														fontWeight: 700,
														color:
															r.checked && !e.over && e.qty > 0 ? "text.primary" : "text.disabled",
													}}
												>
													{r.checked && !e.over && e.qty > 0 ? formatCurrency(e.amount) : "—"}
												</Box>
											</Box>
											{e.over && (
												<Box component="tr">
													<Box
														component="td"
														colSpan={8}
														sx={{
															p: "0 12px 9px 16px",
															bgcolor: designTokens.errorBg,
															borderBottom: "1px solid",
															borderColor: designTokens.errorBorder,
														}}
													>
														<Box
															sx={{
																display: "inline-flex",
																alignItems: "center",
																gap: "6px",
																fontSize: 12,
																fontWeight: 600,
																color: "error.main",
															}}
														>
															<ErrorOutlineIcon sx={{ fontSize: 13 }} />
															{t("transaction.refund.maxError", {
																max: Math.max(c.available, 0),
																unit: c.unit,
																refunded: c.refunded,
																sold: c.sold,
															})}
														</Box>
													</Box>
												</Box>
											)}
										</React.Fragment>
									);
								})}
							</tbody>
						</Box>
					</Box>

					<Box sx={{ mt: "22px", display: "flex", flexDirection: "column", gap: "7px" }}>
						<Typography
							component="label"
							sx={{ fontSize: 13, fontWeight: 600, color: designTokens.gray700 }}
						>
							{t("transaction.refund.reason")}{" "}
							<Box component="span" sx={{ color: "error.main" }}>
								*
							</Box>
						</Typography>
						<TextField
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								touch();
							}}
							size="small"
							fullWidth
							multiline
							minRows={2}
							placeholder={t("transaction.refund.reasonPlaceholder")}
							disabled={isSaving}
							error={reasonErr}
							helperText={reasonErr ? t("transaction.refund.reasonError") : undefined}
						/>
					</Box>

					<Box
						sx={{
							display: "flex",
							gap: "10px",
							alignItems: "flex-start",
							mt: "20px",
							p: "12px 14px",
							bgcolor: "rgba(42,111,151,0.08)",
							border: "1px solid rgba(42,111,151,0.24)",
							borderRadius: "8px",
						}}
					>
						<InfoOutlinedIcon
							sx={{ fontSize: 17, color: "info.main", mt: "1px", flex: "0 0 auto" }}
						/>
						<Typography sx={{ fontSize: 12.5, color: "info.main", lineHeight: 1.5 }}>
							{t("transaction.refund.immutable")}
						</Typography>
					</Box>
				</DialogContent>

				<DialogActions
					sx={{
						px: "24px",
						py: "14px",
						gap: "10px",
						borderTop: "1px solid",
						borderColor: "divider",
						bgcolor: designTokens.gray25,
					}}
				>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							fontSize: 13,
							color: "text.secondary",
							flexWrap: "wrap",
						}}
					>
						<Box component="span">
							{t("transaction.refund.totalPositions")}{" "}
							<Box component="b" sx={{ ...numericSx, color: "text.primary" }}>
								{posCount}
							</Box>
						</Box>
						<MetaDot />
						<Box component="span">
							{t("transaction.refund.totalAmount")}{" "}
							<Box component="b" sx={{ ...numericSx, color: "text.primary" }}>
								−{formatCurrency(totalAmount)} UZS
							</Box>
						</Box>
					</Box>
					<Box sx={{ flexGrow: 1 }} />
					<GhostButton onClick={requestClose} disabled={isSaving}>
						{t("common.cancel")}
					</GhostButton>
					<PrimaryButton icon={<CheckIcon />} onClick={submit} disabled={isSaving}>
						{t("transaction.refund.submit")}
					</PrimaryButton>
				</DialogActions>
			</Dialog>

			<ConfirmDialog
				isOpen={discardOpen}
				icon={<ReportProblemOutlinedIcon sx={{ fontSize: 22 }} />}
				iconTone="warning"
				title={t("common.dialog.discardChanges.title")}
				content={t("common.dialog.discardChanges.body")}
				confirmLabel={t("common.dialog.discardChanges.confirm")}
				cancelLabel={t("common.dialog.discardChanges.cancel")}
				confirmVariant="danger"
				onConfirm={confirmDiscard}
				onCancel={cancelDiscard}
			/>
		</>
	);
};

export default RefundModal;
