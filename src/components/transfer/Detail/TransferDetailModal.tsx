import React from "react";
import { useTranslation } from "react-i18next";
import { detailTableSx } from "components/product/Detail/detailTableSx";
import GhostButton from "components/shared/Buttons/GhostButton";
import FormDialogHeader from "components/shared/Dialog/Form/FormDialogHeader";
import { Transfer, transferUnits } from "models/transfer";
import { designTokens, numericSx } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatQuantity } from "utils/formatCurrency";
import { MEASUREMENT_SHORT } from "utils/productUtils";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

interface TransferDetailModalProps {
	transfer: Transfer | null;
	onClose: () => void;
}

const RouteNode: React.FC<{ label: string; name: string }> = ({ label, name }) => (
	<Box sx={{ flex: 1, minWidth: 0 }}>
		<Typography sx={{ fontSize: 11.5, color: "text.secondary", mb: "4px" }}>{label}</Typography>
		<Typography
			component="div"
			sx={{
				fontSize: 15,
				fontWeight: 700,
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
			}}
		>
			<WarehouseOutlinedIcon sx={{ fontSize: 17, color: "primary.main" }} />
			{name}
		</Typography>
	</Box>
);

/**
 * Read-only transfer detail per the bundle: a from → to route header, the line
 * items table with a totals row, the note, and the immutability hint. Transfers
 * are immutable (rule 16) — there are no actions here beyond «Закрыть».
 */
export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({ transfer, onClose }) => {
	const { t } = useTranslation();

	if (!transfer) {
		return null;
	}

	return (
		<Dialog
			open
			onClose={onClose}
			disableRestoreFocus
			slotProps={{ paper: { sx: { width: 640, maxWidth: "94%", borderRadius: "12px" } } }}
		>
			<FormDialogHeader
				title={t("transfer.detail.title")}
				subtitle={`${formatDateTime(transfer.date)} · ${transfer.createdBy}`}
				disabled={false}
				onClose={onClose}
			/>

			<DialogContent dividers sx={{ pt: 2 }}>
				{/* from → to route */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: "12px",
						p: "16px 18px",
						mb: "18px",
						bgcolor: designTokens.gray25,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
					}}
				>
					<RouteNode label={t("transfer.detail.from")} name={transfer.fromWarehouseName} />
					<Box
						sx={{
							width: 38,
							height: 38,
							flex: "0 0 auto",
							borderRadius: "50%",
							display: "grid",
							placeItems: "center",
							bgcolor: "primary.light",
							color: "primary.main",
						}}
					>
						<ChevronRightIcon sx={{ fontSize: 20 }} />
					</Box>
					<RouteNode label={t("transfer.detail.to")} name={transfer.toWarehouseName} />
				</Box>

				{/* lines */}
				<Box
					component="table"
					sx={{
						...detailTableSx,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: "8px",
					}}
				>
					<thead>
						<tr>
							<Box component="th">{t("transfer.table.product")}</Box>
							<Box component="th">{t("transfer.table.sku")}</Box>
							<Box component="th" className="r">
								{t("transfer.table.quantity")}
							</Box>
							<Box component="th">{t("transfer.table.unit")}</Box>
						</tr>
					</thead>
					<tbody>
						{transfer.lines.map((line) => (
							<tr key={line.productId}>
								<td>
									<Box component="span" sx={{ fontWeight: 600 }}>
										{line.productName}
									</Box>
								</td>
								<td>
									<Box component="span" sx={{ ...numericSx, fontSize: 12, color: "text.disabled" }}>
										{line.sku}
									</Box>
								</td>
								<td className="r">
									<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
										{formatQuantity(line.quantity)}
									</Box>
								</td>
								<td>
									<Box component="span" sx={{ color: "text.secondary" }}>
										{MEASUREMENT_SHORT[line.measurement]}
									</Box>
								</td>
							</tr>
						))}
						<tr className="total">
							<td>{t("transfer.detail.totalPositions", { positions: transfer.lines.length })}</td>
							<td />
							<td className="r">
								<Box component="span" sx={{ ...numericSx, fontWeight: 800 }}>
									{formatQuantity(transferUnits(transfer))}
								</Box>
							</td>
							<td>
								<Box component="span" sx={{ color: "text.secondary" }}>
									{t("transfer.unitFallback")}
								</Box>
							</td>
						</tr>
					</tbody>
				</Box>

				{transfer.note && (
					<Box
						sx={{
							display: "flex",
							alignItems: "flex-start",
							gap: "8px",
							mt: "16px",
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
						{transfer.note}
					</Box>
				)}

				<Box
					sx={{
						display: "flex",
						gap: "10px",
						alignItems: "flex-start",
						mt: "16px",
						p: "11px 13px",
						bgcolor: "primary.light",
						border: "1px solid",
						borderColor: designTokens.primaryLine,
						borderRadius: "8px",
					}}
				>
					<InfoOutlinedIcon
						sx={{ fontSize: 16, color: "primary.main", mt: "1px", flex: "0 0 auto" }}
					/>
					<Typography sx={{ fontSize: 12.5, color: "primary.dark", lineHeight: 1.55 }}>
						{t("transfer.detail.immutableHintBefore")}{" "}
						<Box component="b">{t("transfer.detail.immutableHintBold")}</Box>
						{t("transfer.detail.immutableHintAfter")}
					</Typography>
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

export default TransferDetailModal;
