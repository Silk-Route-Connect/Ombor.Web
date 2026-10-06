import React from "react";
import { useTranslation } from "react-i18next";
import ProductLink from "components/product/Links/ProductLink";
import FactRow, { FactList } from "components/shared/Detail/FactRow";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import EntityAvatar from "components/shared/EntityAvatar/EntityAvatar";
import { recordTile } from "components/shared/IconTile/recordTile";
import { CopyableCell } from "components/shared/Table/CopyableCell";
import DirectionChip from "components/stockAdjustment/DirectionChip";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { StockAdjustment } from "models/stockAdjustment";
import { designTokens, numericSx, radius } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { formatEntityId } from "utils/formatEntityId";
import { adjustmentValue } from "utils/listTotals";
import { measurementShort } from "utils/productUtils";

import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Typography } from "@mui/material";

interface StockAdjustmentDetailModalProps {
	adjustment: StockAdjustment | null;
	onClose: () => void;
}

/**
 * Read-only stock-adjustment detail (rule 23 — immutable, no edit / delete):
 * titled «Корректировка №N» like its list row, a product · direction ·
 * signed-quantity summary, the audited facts and the note. Opened from a row
 * click on the adjustments table. Product + warehouse deep-link.
 */
export const StockAdjustmentDetailModal: React.FC<StockAdjustmentDetailModalProps> = ({
	adjustment,
	onClose,
}) => {
	const { t } = useTranslation();

	if (!adjustment) {
		return null;
	}

	const unit = measurementShort(t, adjustment.measurement);
	const isDown = adjustment.direction === "Decrease";
	const value = adjustmentValue(adjustment);

	return (
		<FormDialog
			open
			size="md"
			// The list labels an adjustment by its id (it has no served number).
			title={t("adjustment.detail.numberedTitle", {
				number: formatEntityId(adjustment.id),
			})}
			subtitle={`${formatDateTime(adjustment.date)} · ${adjustment.createdBy}`}
			tile={recordTile("Adjustment")}
			onClose={onClose}
			footer={<FormDialogFooter variant="close" onClose={onClose} />}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "12px",
					flexWrap: "wrap",
					p: "16px 18px",
					mb: "8px",
					bgcolor: designTokens.bgSubtle,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
				}}
			>
				<Box sx={{ minWidth: 0 }}>
					<Typography sx={{ fontSize: 13, color: "text.secondary", mb: "4px" }}>
						{t("adjustment.table.product")}
					</Typography>
					<Typography component="div" sx={{ fontSize: 15, fontWeight: 600 }}>
						<ProductLink id={adjustment.productId} name={adjustment.productName} />
					</Typography>
				</Box>
				<Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<DirectionChip direction={adjustment.direction} />
					<Box component="span" sx={{ ...numericSx, fontSize: 18, fontWeight: 700 }}>
						{isDown ? "−" : "+"}
						{formatQuantity(adjustment.quantity)}{" "}
						<Box component="span" sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>
							{unit}
						</Box>
					</Box>
				</Box>
			</Box>

			<FactList grid inset={false}>
				<FactRow stacked label={t("adjustment.table.warehouse")}>
					<WarehouseLink id={adjustment.warehouseId} name={adjustment.warehouseName} />
				</FactRow>
				<FactRow stacked label={t("adjustment.table.sku")} figures="proportional">
					<CopyableCell value={adjustment.sku}>{adjustment.sku}</CopyableCell>
				</FactRow>
				<FactRow stacked label={t("adjustment.table.category")}>
					{adjustment.categoryName}
				</FactRow>
				<FactRow stacked label={t("adjustment.table.reason")}>
					{t(`adjustment.reason.${adjustment.reason}`)}
				</FactRow>
				<FactRow stacked label={t("adjustment.detail.balanceAfter")} figures="tabular">
					{formatQuantity(adjustment.balanceAfter)} {unit}
				</FactRow>
				<FactRow
					stacked
					label={t("adjustment.detail.unitCost")}
					money={value === null ? null : adjustment.unitCost}
				/>
				<FactRow
					stacked
					label={t(`adjustment.detail.value.${adjustment.direction}`)}
					money={value}
				/>
				<FactRow stacked label={t("adjustment.detail.createdBy")}>
					<Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
						<EntityAvatar name={adjustment.createdBy} size={22} />
						{adjustment.createdBy}
					</Box>
				</FactRow>
			</FactList>

			<Box
				sx={{
					mt: "12px",
					display: "flex",
					alignItems: "flex-start",
					gap: "8px",
					p: "11px 14px",
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
					fontSize: 13,
					color: designTokens.gray700,
					lineHeight: 1.55,
				}}
			>
				<ReceiptLongOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mt: "1px" }} />
				{adjustment.note ?? (
					<Box component="span" sx={{ color: "text.disabled" }}>
						{t("adjustment.detail.noNote")}
					</Box>
				)}
			</Box>
		</FormDialog>
	);
};

export default StockAdjustmentDetailModal;
