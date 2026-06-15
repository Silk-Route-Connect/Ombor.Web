import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import {
	TransactionStatusChip,
	TransactionTypeBadge,
} from "components/transaction/TransactionBadges";
import { TransactionRecord } from "models/transaction";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { isRefundType, TransactionDirection } from "utils/transactionUtils";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
	Box,
	ButtonBase,
	IconButton,
	Link,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";

interface TransactionDetailHeaderProps {
	tx: TransactionRecord;
	direction: TransactionDirection;
	onBack: () => void;
	onCreateRefund: () => void;
	onPartner: () => void;
	onDownload: () => void;
}

const Dot: React.FC = () => (
	<Box
		component="span"
		sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: designTokens.gray300, mx: "4px" }}
	/>
);

export const TransactionDetailHeader: React.FC<TransactionDetailHeaderProps> = ({
	tx,
	direction,
	onBack,
	onCreateRefund,
	onPartner,
	onDownload,
}) => {
	const { t } = useTranslation();
	const refund = isRefundType(tx.type);
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);

	return (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
					mb: "16px",
					fontSize: 13,
					color: "text.secondary",
				}}
			>
				<Link
					component="button"
					underline="hover"
					onClick={onBack}
					sx={{ color: "text.secondary", fontSize: 13 }}
				>
					{t(`transaction.list.title.${direction}`)}
				</Link>
				<ChevronRightIcon sx={{ fontSize: 14 }} />
				<Typography
					component="b"
					sx={{ ...numericSx, fontSize: 13, fontWeight: 600, color: "text.primary" }}
				>
					#{tx.transactionNumber ?? tx.id}
				</Typography>
			</Box>

			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "20px",
					mb: "20px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
					<ButtonBase
						onClick={onBack}
						aria-label={t("transaction.detail.back")}
						sx={{
							width: 40,
							height: 40,
							flex: "0 0 auto",
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							bgcolor: "background.paper",
							color: designTokens.gray700,
							"&:hover": { bgcolor: designTokens.gray50, borderColor: designTokens.gray400 },
						}}
					>
						<ChevronLeftIcon sx={{ fontSize: 20 }} />
					</ButtonBase>

					<Box sx={{ minWidth: 0 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
							<Typography
								component="h1"
								sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}
							>
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 600 }}>
									#
								</Box>
								{tx.transactionNumber ?? tx.id}
							</Typography>
							<TransactionTypeBadge type={tx.type} large />
							{!refund && tx.paymentStatus && (
								<TransactionStatusChip status={tx.paymentStatus} full />
							)}
						</Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								flexWrap: "wrap",
								gap: "2px",
								mt: "5px",
								fontSize: 13.5,
								color: "text.secondary",
								...numericSx,
							}}
						>
							<EventOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mr: "6px" }} />
							{formatDate(tx.date)}
							{tx.time ? ` · ${tx.time}` : ""}
							<Dot />
							<Box
								component="span"
								onClick={onPartner}
								sx={{
									color: "primary.main",
									fontWeight: 600,
									cursor: "pointer",
									fontFamily: "inherit",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								{tx.partnerName}
							</Box>
							<Dot />
							<WarehouseOutlinedIcon sx={{ fontSize: 14, color: "text.disabled", mr: "6px" }} />
							{tx.warehouseName}
						</Box>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flex: "0 0 auto" }}>
					<GhostButton
						icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
						onClick={onDownload}
					>
						{t("transaction.detail.download")}
					</GhostButton>
					{!refund && (
						<>
							<IconButton
								onClick={(e) => setAnchor(e.currentTarget)}
								aria-label="actions"
								sx={{
									width: 38,
									height: 38,
									borderRadius: "8px",
									border: "1px solid",
									borderColor: designTokens.gray300,
									color: designTokens.gray600,
								}}
							>
								<MoreVertIcon sx={{ fontSize: 20 }} />
							</IconButton>
							<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
								<MenuItem
									onClick={() => {
										setAnchor(null);
										onCreateRefund();
									}}
								>
									<ListItemIcon>
										<UndoOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
									</ListItemIcon>
									<ListItemText primary={t("transaction.detail.createRefund")} />
								</MenuItem>
							</Menu>
						</>
					)}
				</Box>
			</Box>
		</>
	);
};

export default TransactionDetailHeader;
