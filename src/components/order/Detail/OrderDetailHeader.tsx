import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import OrderSourceChip from "components/order/OrderSourceChip";
import OrderStatusChip from "components/order/OrderStatusChip";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Order } from "models/order";
import { designTokens, numericSx } from "theme";
import { formatDate } from "utils/dateUtils";
import { isOrderEditable, ORDER_NEXT_STEP, PRE_DELIVERY } from "utils/orderUtils";

import CheckIcon from "@mui/icons-material/Check";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import {
	Box,
	Divider,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Typography,
} from "@mui/material";

const STEP_ICON: Record<string, React.ReactNode> = {
	process: <CheckIcon />,
	ship: <LocalShippingOutlinedIcon />,
	deliver: <CheckIcon />,
};

interface OrderDetailHeaderProps {
	order: Order;
	onBack: () => void;
	onAdvance: (order: Order) => void;
	onEdit: (order: Order) => void;
	onCancel: (order: Order) => void;
	onReject: (order: Order) => void;
	onReturn: (order: Order) => void;
	onOpenSale: (saleId: number) => void;
	onOpenCustomer: () => void;
	onDownload: () => void;
}

const SaleLink: React.FC<{
	caption: string;
	saleId: number;
	muted?: boolean;
	onClick: () => void;
}> = ({ caption, saleId, muted, onClick }) => (
	<Box
		onClick={onClick}
		sx={{
			display: "flex",
			alignItems: "center",
			gap: "11px",
			p: "7px 12px",
			borderRadius: "8px",
			cursor: "pointer",
			border: "1px solid",
			...(muted
				? {
						bgcolor: designTokens.gray50,
						borderColor: designTokens.gray200,
						color: "text.secondary",
					}
				: {
						bgcolor: "rgba(23,131,90,0.10)",
						borderColor: "rgba(23,131,90,0.28)",
						color: "success.main",
					}),
		}}
	>
		<ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />
		<Box>
			<Typography sx={{ fontSize: 11, lineHeight: 1.2 }}>{caption}</Typography>
			<Typography sx={{ ...numericSx, fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}>
				#{saleId}
			</Typography>
		</Box>
		<ChevronRightIcon sx={{ fontSize: 16 }} />
	</Box>
);

export const OrderDetailHeader: React.FC<OrderDetailHeaderProps> = ({
	order,
	onBack,
	onAdvance,
	onEdit,
	onCancel,
	onReject,
	onReturn,
	onOpenSale,
	onOpenCustomer,
	onDownload,
}) => {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const close = () => setAnchor(null);
	const run = (fn: () => void) => () => {
		close();
		fn();
	};

	const step = ORDER_NEXT_STEP[order.status];

	return (
		<>
			<Box
				sx={{
					display: "flex",
					alignItems: "flex-start",
					justifyContent: "space-between",
					gap: "16px",
					flexWrap: "wrap",
					mb: "18px",
				}}
			>
				<Box sx={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: 0 }}>
					<IconButton
						onClick={onBack}
						sx={{
							width: 38,
							height: 38,
							borderRadius: "8px",
							border: "1px solid",
							borderColor: designTokens.gray300,
							color: designTokens.gray600,
						}}
					>
						<ChevronLeftIcon sx={{ fontSize: 20 }} />
					</IconButton>
					<Box sx={{ minWidth: 0 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
							<Typography
								variant="h1"
								sx={{ ...numericSx, display: "inline-flex", alignItems: "baseline" }}
							>
								<Box component="span" sx={{ color: "text.disabled", fontWeight: 600 }}>
									#
								</Box>
								{order.orderNumber}
							</Typography>
							<OrderStatusChip status={order.status} withIcon />
							<OrderSourceChip source={order.source} />
						</Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								mt: "6px",
								fontSize: 13.5,
								color: "text.secondary",
							}}
						>
							{t("order.detail.createdOn", { date: formatDate(order.date) })}
							<Box
								component="span"
								sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: designTokens.gray300 }}
							/>
							<Box
								component="span"
								onClick={onOpenCustomer}
								sx={{
									color: "primary.main",
									fontWeight: 600,
									cursor: "pointer",
									"&:hover": { textDecoration: "underline" },
								}}
							>
								{order.customerName}
							</Box>
						</Box>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
					{step && (
						<PrimaryButton icon={STEP_ICON[step.action]} onClick={() => onAdvance(order)}>
							{t(`order.action.${step.action}`)}
						</PrimaryButton>
					)}
					{order.status === "Delivered" && order.saleId != null && (
						<SaleLink
							caption={t("order.detail.promotedSale")}
							saleId={order.saleId}
							onClick={() => onOpenSale(order.saleId!)}
						/>
					)}
					{order.status === "Returned" && order.saleId != null && (
						<SaleLink
							caption={t("order.detail.originalSale")}
							saleId={order.saleId}
							muted
							onClick={() => onOpenSale(order.saleId!)}
						/>
					)}
					<IconButton
						onClick={(e) => setAnchor(e.currentTarget)}
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
					<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close}>
						{isOrderEditable(order.status) && (
							<MenuItem onClick={run(() => onEdit(order))}>
								<ListItemIcon>
									<EditOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
								</ListItemIcon>
								<ListItemText primary={t("common.edit")} />
							</MenuItem>
						)}
						<MenuItem onClick={run(onDownload)}>
							<ListItemIcon>
								<DownloadOutlinedIcon fontSize="small" sx={{ color: "text.secondary" }} />
							</ListItemIcon>
							<ListItemText primary={t("order.action.download")} />
						</MenuItem>
						{order.status === "Delivered" && (
							<MenuItem onClick={run(() => onReturn(order))}>
								<ListItemIcon>
									<UndoOutlinedIcon fontSize="small" sx={{ color: "error.main" }} />
								</ListItemIcon>
								<ListItemText
									primary={t("order.action.return")}
									slotProps={{ primary: { sx: { color: "error.main" } } }}
								/>
							</MenuItem>
						)}
						{PRE_DELIVERY.includes(order.status) && <Divider />}
						{PRE_DELIVERY.includes(order.status) && (
							<MenuItem onClick={run(() => onReject(order))}>
								<ListItemIcon>
									<CloseIcon fontSize="small" sx={{ color: designTokens.saffron600 }} />
								</ListItemIcon>
								<ListItemText
									primary={t("order.action.reject")}
									slotProps={{ primary: { sx: { color: designTokens.saffron700 } } }}
								/>
							</MenuItem>
						)}
						{PRE_DELIVERY.includes(order.status) && (
							<MenuItem onClick={run(() => onCancel(order))}>
								<ListItemIcon>
									<DeleteOutlineIcon fontSize="small" sx={{ color: "error.main" }} />
								</ListItemIcon>
								<ListItemText
									primary={t("order.action.cancel")}
									slotProps={{ primary: { sx: { color: "error.main" } } }}
								/>
							</MenuItem>
						)}
					</Menu>
				</Box>
			</Box>
		</>
	);
};

export default OrderDetailHeader;
