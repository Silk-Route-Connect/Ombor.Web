import React from "react";
import { useTranslation } from "react-i18next";
import MetaDot from "components/shared/Detail/MetaDot";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import FormField from "components/shared/Forms/FormField";
import FormFieldLabel from "components/shared/Forms/FormFieldLabel";
import { recordTile } from "components/shared/IconTile/recordTile";
import InfoHint from "components/shared/InfoHint/InfoHint";
import UzsUnit from "components/shared/Money/UzsUnit";
import { useDirtyClose } from "hooks/shared/useDirtyClose";
import { useRefundForm } from "hooks/transactions/useRefundForm";
import { CreateRefundRequest, TransactionRecord } from "models/transaction";
import { figuresSx, numericSx, radius } from "theme";
import { formatDate } from "utils/dateUtils";
import { formatCurrency } from "utils/formatCurrency";
import { formatOptionalNumber } from "utils/formatEntityId";
import { directionOf } from "utils/transactionUtils";

import CheckIcon from "@mui/icons-material/Check";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, TextField, Typography } from "@mui/material";

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

	const meta = (
		<Box
			component="span"
			sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
		>
			<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
				<PersonOutlineIcon sx={{ fontSize: 14, color: "text.disabled" }} />
				{transaction.partnerName}
			</Box>
			<MetaDot />
			<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
				<WarehouseOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
				{transaction.warehouseName}
			</Box>
			<MetaDot />
			<Box
				component="span"
				sx={{ display: "inline-flex", alignItems: "center", gap: "5px", ...figuresSx }}
			>
				<EventOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
				{formatDate(transaction.date)}
			</Box>
		</Box>
	);

	return (
		<FormDialog
			open
			size="lg"
			title={t(`transaction.refund.title.${direction}`, {
				number: formatOptionalNumber(transaction.transactionNumber, t("common.noNumberInline")),
			})}
			subtitle={meta}
			tile={recordTile(direction === "Sale" ? "SaleRefund" : "SupplyRefund")}
			busy={isSaving}
			onClose={requestClose}
			discard={{ open: discardOpen, onConfirm: confirmDiscard, onCancel: cancelDiscard }}
			footer={
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
									{formatCurrency(form.totalAmount)}
									<UzsUnit />
								</Box>
							</Box>
						</Box>
					}
				/>
			}
		>
			<FormFieldLabel label={t("transaction.refund.sectionLabel")} required />
			<Box
				sx={{
					mt: "8px",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.lg}px`,
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
								{t("transaction.refund.col.unitPrice")}{" "}
								<InfoHint text={t(`transaction.refund.priceHint.${direction}`)} />
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

			<FormField label={t("transaction.refund.reason")} required sx={{ mt: "22px" }}>
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
			</FormField>
		</FormDialog>
	);
};

export default RefundModal;
