import React from "react";
import { useTranslation } from "react-i18next";
import FormDialog from "components/shared/Dialog/Form/FormDialog";
import FormDialogFooter from "components/shared/Dialog/Form/FormDialogFooter";
import { recordTile } from "components/shared/IconTile/recordTile";
import TransferLinesTable from "components/transfer/Detail/TransferLinesTable";
import WarehouseLink from "components/warehouse/Links/WarehouseLink";
import { Transfer } from "models/transfer";
import { designTokens, radius } from "theme";
import { formatDateTime } from "utils/dateUtils";
import { formatEntityId } from "utils/formatEntityId";

import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Typography } from "@mui/material";

interface TransferDetailModalProps {
	transfer: Transfer | null;
	onClose: () => void;
}

const RouteNode: React.FC<{
	label: string;
	id: number;
	name: string;
	align?: "left" | "right";
}> = ({ label, id, name, align = "left" }) => (
	<Box sx={{ flex: 1, minWidth: 0, textAlign: align }}>
		<Typography sx={{ fontSize: 13, color: "text.secondary", mb: "4px" }}>{label}</Typography>
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
			<WarehouseLink id={id} name={name} />
		</Typography>
	</Box>
);

/**
 * Read-only transfer detail per the bundle, titled «Перемещение №N» like its
 * list row: a from → to route header, the line items table with a totals row
 * and the note. Transfers are immutable (rule 16) — there are no actions here
 * beyond «Закрыть».
 */
export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({ transfer, onClose }) => {
	const { t } = useTranslation();

	if (!transfer) {
		return null;
	}

	return (
		<FormDialog
			open
			size="md"
			// The list labels a transfer by its id (it has no served number).
			title={t("transfer.detail.numberedTitle", {
				number: formatEntityId(transfer.id),
			})}
			subtitle={`${formatDateTime(transfer.date)} · ${transfer.createdBy}`}
			tile={recordTile("Transfer")}
			onClose={onClose}
			footer={<FormDialogFooter variant="close" onClose={onClose} />}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					p: "16px 18px",
					mb: "18px",
					bgcolor: designTokens.bgSubtle,
					border: "1px solid",
					borderColor: "divider",
					borderRadius: `${radius.md}px`,
				}}
			>
				<RouteNode
					label={t("transfer.detail.from")}
					id={transfer.fromWarehouseId}
					name={transfer.fromWarehouseName}
					align="right"
				/>
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
				<RouteNode
					label={t("transfer.detail.to")}
					id={transfer.toWarehouseId}
					name={transfer.toWarehouseName}
				/>
			</Box>

			<TransferLinesTable transfer={transfer} />

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
						borderRadius: `${radius.md}px`,
						fontSize: 13,
						color: designTokens.gray700,
						lineHeight: 1.55,
					}}
				>
					<ReceiptLongOutlinedIcon sx={{ fontSize: 15, color: "text.disabled", mt: "1px" }} />
					{transfer.note}
				</Box>
			)}
		</FormDialog>
	);
};

export default TransferDetailModal;
