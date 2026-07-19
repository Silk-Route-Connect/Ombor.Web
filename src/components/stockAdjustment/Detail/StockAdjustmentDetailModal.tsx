import React from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { CopyableCell } from "components/shared/Table/CopyableCell";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { StockAdjustment } from "models/stockAdjustment";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Avatar, Box, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

interface StockAdjustmentDetailModalProps {
	adjustment: StockAdjustment | null;
	onClose: () => void;
}

/** One labelled audited field (mirrors the former expand-panel field). */
const Field: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({
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

/**
 * Read-only stock-adjustment detail (rule 23 — immutable, no edit / delete):
 * a product · direction · signed-quantity summary, the audited fields, and the
 * note. Opened from a row click on the adjustments table (replaces the former
 * expand-row panel). Product + warehouse cells deep-link.
 */
export const StockAdjustmentDetailModal: React.FC<StockAdjustmentDetailModalProps> = ({
	adjustment,
	onClose,
}) => {
	const { t } = useTranslation();

	if (!adjustment) {
		return null;
	}

	const unit = MEASUREMENT_SHORT[adjustment.measurement];
	const isDown = adjustment.direction === "Decrease";

	return (
		<Dialog
			open
			onClose={onClose}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 560, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("adjustment.detail.title")}
				subtitle={`${formatDateTime(adjustment.date)} · ${adjustment.createdBy}`}
				disabled={false}
				onClose={onClose}
			/>

			<DialogContent dividers sx={{ pt: 2 }}>
				{/* product · direction · signed quantity */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "12px",
						flexWrap: "wrap",
						p: "16px 18px",
						mb: "18px",
						bgcolor: designTokens.gray25,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
					}}
				>
					<Box sx={{ minWidth: 0 }}>
						<Typography sx={{ fontSize: 11.5, color: "text.secondary", mb: "4px" }}>
							{t("adjustment.table.product")}
						</Typography>
						<Typography component="div" sx={{ fontSize: 15, fontWeight: 600 }}>
							<ProductLink id={adjustment.productId} name={adjustment.productName} />
						</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
						<DirectionChip direction={adjustment.direction} />
						<Box
							component="span"
							sx={{
								...numericSx,
								fontSize: 18,
								fontWeight: 700,
								color: isDown ? "error.main" : "success.main",
							}}
						>
							{isDown ? "−" : "+"}
							{formatQuantity(adjustment.quantity)}{" "}
							<Box component="span" sx={{ fontSize: 13, color: "text.disabled", fontWeight: 600 }}>
								{unit}
							</Box>
						</Box>
					</Box>
				</Box>

				{/* audited fields */}
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
						gap: "18px 28px",
					}}
				>
					<Field label={t("adjustment.table.warehouse")}>
						<WarehouseLink id={adjustment.warehouseId} name={adjustment.warehouseName} />
					</Field>
					<Field label={t("adjustment.table.sku")} mono>
						<CopyableCell value={adjustment.sku}>{adjustment.sku}</CopyableCell>
					</Field>
					<Field label={t("adjustment.table.category")}>{adjustment.categoryName ?? "—"}</Field>
					<Field label={t("adjustment.table.reason")}>
						{t(`adjustment.reason.${adjustment.reason}`)}
					</Field>
					<Field label={t("adjustment.detail.balanceAfter")} mono>
						{formatQuantity(adjustment.balanceAfter)} {unit}
					</Field>
					<Field label={t("adjustment.detail.createdBy")}>
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
					</Field>
				</Box>

				{/* note */}
				<Box
					sx={{
						mt: "18px",
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
			</DialogContent>

			<DialogActions
				sx={{
					px: "24px",
					py: "14px",
					borderTop: "1px solid",
					borderColor: "divider",
					bgcolor: designTokens.gray25,
				}}
			>
				<GhostButton onClick={onClose}>{t("close")}</GhostButton>
			</DialogActions>
		</Dialog>
	);
};

export default StockAdjustmentDetailModal;
