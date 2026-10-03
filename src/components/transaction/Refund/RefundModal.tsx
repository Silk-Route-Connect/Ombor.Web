import React from "react";
import { useTranslation } from "react-i18next";
import MetaDot from "components/shared/Detail/MetaDot";
import ConfirmDialog from "components/shared/Dialog/ConfirmDialog/ConfirmDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useRefundForm } from "hooks/transactions/useRefundForm";
import { CreateRefundRequest, TransactionRecord } from "models/transaction";
import { designTokens, dialogPaperSx, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { directionOf } from "utils/transactionUtils";

import CheckIcon from "@mui/icons-material/Check";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Dialog, DialogContent, LinearProgress, TextField, Typography } from "@mui/material";

import RefundLineRow from "./RefundLineRow";
import { refundHeadCellSx } from "./refundTableSx";

interface RefundModalProps {
	transaction: TransactionRecord;
	/** Prior refunds of this transaction — drives the already-refunded / available math. */
	priorRefunds?: TransactionRecord[];
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (payload: CreateRefundRequest) => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
	transaction,
	priorRefunds = [],
	isSaving,
	onClose,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const direction = directionOf(transaction.type);

	const form = useRefundForm({ transaction, priorRefunds, onSubmit });

	const { discardOpen, requestClose, confirmDiscard, cancelDiscard } = useDirtyClose(
		form.dirty,
		isSaving,
		onClose,
	);

	return (
		<>
			<Dialog
				open
				onClose={requestClose}
				disableEscapeKeyDown={isSaving}
				disableRestoreFocus
				slotProps={{ paper: { sx: dialogPaperSx("lg") } }}
			>
				<FormDialogHeader
					title={t(`transaction.refund.title.${direction}`, {
						number: formatEntityId(transaction.transactionNumber ?? transaction.id),
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
						fontSize: 13,
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
										sx={{ ...refundHeadCellSx, width: 44, textAlign: "left", pl: "16px" }}
									/>
									<Box component="th" sx={{ ...refundHeadCellSx, textAlign: "left" }}>
										{t("transaction.refund.col.product")}
									</Box>
									<Box component="th" sx={refundHeadCellSx}>
										{t("transaction.refund.col.sold")}
									</Box>
									<Box component="th" sx={refundHeadCellSx}>
										{t("transaction.refund.col.refunded")}
									</Box>
									<Box component="th" sx={refundHeadCellSx}>
										{t("transaction.refund.col.available")}
									</Box>
									<Box component="th" sx={{ ...refundHeadCellSx, width: 122 }}>
										{t("transaction.refund.col.toRefund")}
									</Box>
									<Box component="th" sx={refundHeadCellSx}>
										{t("transaction.refund.col.unitPrice")}
									</Box>
									<Box component="th" sx={refundHeadCellSx}>
										{t("transaction.refund.col.amount")}
									</Box>
								</tr>
							</thead>
							<tbody>
								{form.lines.map((line, i) => (
									<RefundLineRow
										key={`${line.productId}-${i}`}
										line={line}
										draft={form.rows[i]}
										check={form.checks[i]}
										onToggle={() => form.toggle(i)}
										onQtyChange={(qty) => form.setQty(i, qty)}
									/>
								))}
							</tbody>
						</Box>
					</Box>

					{form.noLines && (
						<Typography sx={{ mt: "10px", color: "error.main", fontSize: 13 }}>
							{t("transaction.refund.noLinesBanner")}
						</Typography>
					)}
					{form.anyOver && (
						<Typography sx={{ mt: "10px", color: "error.main", fontSize: 13 }}>
							{t("transaction.refund.overBanner")}
						</Typography>
					)}

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
							value={form.reason}
							onChange={(e) => form.setReason(e.target.value)}
							size="small"
							fullWidth
							multiline
							minRows={2}
							placeholder={t("transaction.refund.reasonPlaceholder")}
							disabled={isSaving}
							error={form.reasonError}
							helperText={form.reasonError ? t("transaction.refund.reasonError") : undefined}
						/>
					</Box>
				</DialogContent>

				<FormDialogFooter
					canSave={!isSaving}
					loading={isSaving}
					onCancel={requestClose}
					onSave={form.submit}
					submitLabel={t("transaction.refund.submit")}
					submitIcon={<CheckIcon />}
					commitNote={t("transaction.refund.commitNote")}
					summary={
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
									{form.posCount}
								</Box>
							</Box>
							<MetaDot />
							<Box component="span">
								{t("transaction.refund.totalAmount")}{" "}
								<Box component="b" sx={{ ...numericSx, color: "text.primary" }}>
									{form.totalAmount > 0 && "−"}
									{formatCurrency(form.totalAmount)} UZS
								</Box>
							</Box>
						</Box>
					}
				/>
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
